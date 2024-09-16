import { z } from "zod";

export class ValidationError extends Error {
  constructor(public errorMessages: string) {
    super("Validation failed");
    this.name = "ValidationError";
  }
}

export const validate = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);

  if (result.success) {
    return result.data;
  } else {
    const errorMessages = result.error.errors
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join("; ");
    throw new ValidationError(errorMessages);
  }
};
