import { z } from "zod";

export const createProductSchema = z
  .object({
    name: z.string().min(1, "Product name is required"),
    price: z.number().positive("Price must be a positive number"),
    description: z.string().optional(),
  })
  .strict();

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const getProductsSchema = z
  .object({
    q: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    sortBy: z.enum(["name", "price", "createdAt"]).default("name"),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
    category: z.string().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().positive().optional(),
  })
  .refine(
    (data) => {
      if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: "minPrice must be less than or equal to maxPrice",
      path: ["minPrice", "maxPrice"],
    }
  );

export type GetProductQueryParams = z.infer<typeof getProductsSchema>;

export const getProductByIdSchema = z
  .object({
    id: z.string(),
  })
  .strict();

export type GetProductByIdParams = z.infer<typeof getProductByIdSchema>;

export const updateProductSchema = z
  .object({
    name: z.string().min(1, "Product name is required"),
    price: z.number().positive("Price must be a positive number"),
    description: z.string().optional(),
  })
  .strict();

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const deleteProductByIdSchema = z
  .object({
    id: z.string(),
  })
  .strict();

export type DeleteProductByIdParams = z.infer<typeof deleteProductByIdSchema>;
