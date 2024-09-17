import logger from "./logger";

type StepFunction<T> = (input: T) => Promise<T>;
type FinallyFunction<T> = (input: T) => void;

export class Workflow<T> {
  private steps: StepFunction<T>[] = [];
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

  create(stepFunction: StepFunction<T>): this {
    this.steps.push(stepFunction);
    return this;
  }

  finally(callback: FinallyFunction<T>): void {
    this.finallyCallback = callback;
  }

  async run(initialInput?: T): Promise<void> {
    let input: T | undefined = initialInput;
    let attempts: number = 0;
    let success: boolean = false;

    for (let i: number = 0; i < this.steps.length; i++) {
      const step: StepFunction<T> = this.steps[i];

      attempts = 0;
      success = false;

      while (attempts < this.retryLimit && !success) {
        try {
          input = await step(input as T);
          success = true;
        } catch (error: unknown) {
          attempts++;
          if (attempts === this.retryLimit) {
            logger.error(
              `Step ${i + 1} failed after ${attempts} attempts:`,
              error instanceof Error ? error.message : String(error)
            );
          }
        }
      }

      if (!success) {
        logger.error("Workflow aborted due to step failure.");
        break;
      }
    }

    if (this.finallyCallback && input !== undefined) {
      try {
        this.finallyCallback(input);
      } catch (error: unknown) {
        logger.error(
          "Error in final step:",
          error instanceof Error ? error.message : String(error)
        );
      }
    }
  }
}
