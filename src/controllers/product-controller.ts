// controllers/product.controller.ts
import { Request, Response } from "express";
import { Document, FilterQuery, Types } from "mongoose";
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
      const {
        q,
        page = 1,
        limit = 2,
        sortBy = "name",
        sortOrder = "asc",
      } = req.query;

      const pageNum = Number(page);
      const limitNum = Number(limit);
      const skip = (pageNum - 1) * limitNum;

      const sort: { [key: string]: 1 | -1 } = {};
      sort[sortBy as string] = sortOrder === "asc" ? 1 : -1;

      const filter: FilterQuery<typeof Product> = {};
      if (typeof q === "string" && q.trim() !== "") {
        filter.$or = [
          { name: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
        ];
      }

      const products = await Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum);

      const total = await Product.countDocuments();
      const totalPages = Math.ceil(total / limitNum);

      res.json({
        products,
        currentPage: pageNum,
        totalPages,
        totalProducts: total,
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
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
}

export default new ProductController();
