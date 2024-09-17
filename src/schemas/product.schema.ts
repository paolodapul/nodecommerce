import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(500),
    price: z.number().min(0),
    category: z.enum(['electronics', 'books', 'clothing', 'food', 'other']),
    inStock: z.boolean().optional(),
  }),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
