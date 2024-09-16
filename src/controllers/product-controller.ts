// controllers/product.controller.ts
import { NextFunction, Request, Response } from "express";
import { Document, Types } from "mongoose";
import { Product } from "../models/product-model";
import {
  CreateProductInput,
  createProductSchema,
  GetProductQueryParams,
  getProductsSchema,
} from "../schemas/product-schema";
import { validate } from "../utils/validator";
import { BadRequestException } from "../types/error-types";
import { createProduct, getAllProducts } from "../core/product";

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

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export type CreateProductBody = Omit<IProduct, "id">;
type UpdateProductBody = Partial<CreateProductBody>;

class ProductController {
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const validationResult = validate(createProductSchema, req.body);
      if (!validationResult.success) {
        throw new BadRequestException(validationResult.errors);
      }
      await createProduct(req.body as CreateProductInput);
      res.status(201).json({ message: "Product created." });
    } catch (error) {
      next(error);
    }
  }

  async getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const validationResult = validate(getProductsSchema, req.query);
      if (!validationResult.success) {
        throw new BadRequestException(validationResult.errors);
      }
      const products = await getAllProducts(
        validationResult.data as GetProductQueryParams
      );
      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req: Request<{ id: string }>, res: Response) {
    try {
      const product = await Product.findById(req.params.id);
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
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
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
      const product = await Product.findByIdAndDelete(req.params.id);
      if (product) {
        res.json({ message: "Product deleted successfully" });
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async addReview(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { message, rating } = req.body as {
        message: string;
        rating: number;
      };
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const review = {
        user: new Types.ObjectId(userId),
        message,
        rating,
      };

      product.reviews.push(review);
      await product.save();

      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }
}

export default new ProductController();
