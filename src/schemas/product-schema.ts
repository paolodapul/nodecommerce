import { z } from "zod";

export const createProductSchema = z
  .object({
    name: z.string().min(1, "Product name is required"),
    price: z.number().positive("Price must be a positive number"),
    description: z.string().optional(),
  })
  .strict();

export type CreateProductInput = z.infer<typeof createProductSchema>;
