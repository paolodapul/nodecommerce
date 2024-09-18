import mongoose from 'mongoose';

// Define types for step functions and finally function
type StepFunction<T, U> = (input: T, session: mongoose.ClientSession) => Promise<U>;
type FinallyFunction<T> = (input: T, session: mongoose.ClientSession) => Promise<void>;

// Workflow class to manage a series of steps
export class Workflow<T> {
  private steps: StepFunction<any, any>[] = []; // Array to store workflow steps
  private retryLimit: number; // Maximum number of retry attempts for each step
  private finallyCallback?: FinallyFunction<T>; // Optional callback to run after all steps

  constructor(retryLimit: number = 3) {
    this.retryLimit = retryLimit;
  }

  // Static method to create and configure a workflow
  static createWorkflow<T>(
    retryLimit: number,
    callback: (workflow: Workflow<T>) => void
  ): Workflow<T> {
    const workflow = new Workflow<T>(retryLimit);
    callback(workflow);
    return workflow;
  }

  // Add a step to the workflow
  create<U, V>(stepFunction: StepFunction<U, V>): this {
    this.steps.push(stepFunction as StepFunction<any, any>);
    return this;
  }

  // Set the finally callback
  finally(callback: FinallyFunction<T>) {
    this.finallyCallback = callback;
  }

  // Execute the workflow
  async run(initialInput: T): Promise<T> {
    const session = await mongoose.startSession();
    session.startTransaction();

    let input = initialInput;

    try {
      // Iterate through each step in the workflow
      for (let i = 0; i < this.steps.length; i++) {
        const step = this.steps[i];
        let attempts = 0;
        let success = false;

        // Retry loop for each step
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

        // If all retry attempts fail, abort the workflow
        if (!success) {
          throw new Error("Workflow aborted due to step failure.");
        }
      }

      // Execute the finally callback if defined
      if (this.finallyCallback) {
        await this.finallyCallback(input, session);
      }

      // Commit the transaction if all steps succeed
      await session.commitTransaction();
      return input;
    } catch (error) {
      // Abort the transaction if any step fails
      await session.abortTransaction();
      console.error("Workflow failed:", error);
      throw error;
    } finally {
      // End the session regardless of success or failure
      session.endSession();
    }
  }
}
