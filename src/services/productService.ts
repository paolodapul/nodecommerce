import { Product } from "../models/productModel";
import { Document, Types } from "mongoose";

export interface IProduct extends Document {
  name: string;
  price: number;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductData = Pick<IProduct, "name" | "price" | "description">;

export type ProductId = string | Types.ObjectId;

export type ProductUpdateData = Partial<ProductData>;

export interface IProductService {
  createProduct(productData: ProductData): Promise<IProduct>;
  getAllProducts(): Promise<IProduct[]>;
  getProductById(id: ProductId): Promise<IProduct | null>;
  updateProduct(
    id: ProductId,
    updateData: ProductUpdateData
  ): Promise<IProduct | null>;
  deleteProduct(id: ProductId): Promise<IProduct | null>;
}

class ProductService implements IProductService {
  async createProduct(productData: ProductData): Promise<IProduct> {
    const product = new Product(productData);
    return await product.save();
  }

  async getAllProducts(): Promise<IProduct[]> {
    return await Product.find();
  }

  async getProductById(id: ProductId): Promise<IProduct | null> {
    return await Product.findById(id);
  }

  async updateProduct(
    id: ProductId,
    updateData: ProductUpdateData
  ): Promise<IProduct | null> {
    return await Product.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteProduct(id: ProductId): Promise<IProduct | null> {
    return await Product.findByIdAndDelete(id);
  }
}

export default new ProductService();
