import { Product } from "../models/product-model";
import { CreateProductInput } from "../schemas/product-schema";

export async function createProduct(productBody: CreateProductInput) {
  const product = new Product(productBody);
  await product.save();
}
