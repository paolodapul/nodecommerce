// controllers/product.controller.ts
import { Request, Response } from "express";
import { Document, Types } from "mongoose";
import { Product } from "../models/product-model";

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

export type CreateProductBody = Omit<IProduct, "id">;
type UpdateProductBody = Partial<CreateProductBody>;

async function getAllProducts(): Promise<IProduct[]> {
  return await Product.find();
}

async function getProductById(id: ProductId): Promise<IProduct | null> {
  return await Product.findById(id);
}

async function updateProduct(
  id: ProductId,
  updateData: ProductUpdateData
): Promise<IProduct | null> {
  return await Product.findByIdAndUpdate(id, updateData, { new: true });
}

async function deleteProduct(id: ProductId): Promise<IProduct | null> {
  return await Product.findByIdAndDelete(id);
}

class ProductController {
  async createProduct(
    req: Request<object, object, CreateProductBody>,
    res: Response
  ) {
    try {
      let product = new Product(req.body as ProductData);
      product = await product.save();
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async getAllProducts(req: Request, res: Response) {
    try {
      const products = await getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async getProductById(req: Request<{ id: string }>, res: Response) {
    try {
      const product = await getProductById(req.params.id);
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async updateProduct(
    req: Request<{ id: string }, object, UpdateProductBody>,
    res: Response
  ) {
    try {
      const product = await updateProduct(req.params.id, req.body);
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async deleteProduct(req: Request<{ id: string }>, res: Response) {
    try {
      const product = await deleteProduct(req.params.id);
      if (product) {
        res.json({ message: "Product deleted successfully" });
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
}

export default new ProductController();
