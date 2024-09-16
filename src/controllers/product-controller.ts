import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { Product } from "../models/product-model";
import {
  CreateProductInput,
  createProductSchema,
  DeleteProductByIdParams,
  deleteProductByIdSchema,
  GetProductByIdParams,
  getProductByIdSchema,
  GetProductQueryParams,
  getProductsSchema,
  UpdateProductInput,
  updateProductSchema,
} from "../schemas/product-schema";
import { validate } from "../utils/validator";
import { BadRequestException } from "../types/error-types";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../core/product";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

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

  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const validationResult = validate(getProductByIdSchema, req.params);
      if (!validationResult.success) {
        throw new BadRequestException(validationResult.errors);
      }
      const product = await getProductById(req.params as GetProductByIdParams);
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const validationResult = validate(updateProductSchema, req.body);
      if (!validationResult.success) {
        throw new BadRequestException(validationResult.errors);
      }
      const product = await updateProduct(
        req.params.id,
        validationResult.data as UpdateProductInput
      );
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const validationResult = validate(deleteProductByIdSchema, req.params);
      if (!validationResult.success) {
        throw new BadRequestException(validationResult.errors);
      }
      const product = await deleteProduct(
        req.params as DeleteProductByIdParams
      );
      res.status(200).json(product);
    } catch (error) {
      next(error);
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
