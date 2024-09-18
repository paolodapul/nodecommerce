import mongoose from 'mongoose';

type StepFunction<T, U> = (input: T, session: mongoose.ClientSession) => Promise<U>;
type FinallyFunction<T> = (input: T, session: mongoose.ClientSession) => Promise<void>;

export class Workflow<T> {
  private steps: StepFunction<any, any>[] = [];
  private retryLimit: number;
  private finallyCallback?: FinallyFunction<T>;

  constructor(retryLimit: number = 3) {
    this.retryLimit = retryLimit;
  }

  static createWorkflow<T>(
    retryLimit: number,
    callback: (workflow: Workflow<T>) => void
  ): Workflow<T> {
    const workflow = new Workflow<T>(retryLimit);
    callback(workflow);
    return workflow;
  }

  create<U, V>(stepFunction: StepFunction<U, V>): this {
    this.steps.push(stepFunction as StepFunction<any, any>);
    return this;
  }

  finally(callback: FinallyFunction<T>) {
    this.finallyCallback = callback;
  }

  async run(initialInput: T): Promise<T> {
    const session = await mongoose.startSession();
    session.startTransaction();

    let input = initialInput;

    try {
      for (let i = 0; i < this.steps.length; i++) {
        const step = this.steps[i];
        let attempts = 0;
        let success = false;

        while (attempts < this.retryLimit && !success) {
          try {
            input = await step(input, session);
            success = true;
          } catch (error) {
            attempts++;
            if (attempts === this.retryLimit) {
              console.error(`Step ${i + 1} failed after ${attempts} attempts:`, error);
              throw error;
            }
          }
        }

        if (!success) {
          throw new Error("Workflow aborted due to step failure.");
        }
      }

      if (this.finallyCallback) {
        await this.finallyCallback(input, session);
      }

      await session.commitTransaction();
      return input;
    } catch (error) {
      await session.abortTransaction();
      console.error("Workflow failed:", error);
      throw error;
    } finally {
      session.endSession();
    }
  }
}
