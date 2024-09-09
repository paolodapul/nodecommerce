// controllers/product.controller.ts
import { Request, Response } from "express";
import ProductService from "../services/productService";
import { IProduct } from "../services/productService";

export type CreateProductBody = Omit<IProduct, "id">;
type UpdateProductBody = Partial<CreateProductBody>;

class ProductController {
  async createProduct(
    req: Request<object, object, CreateProductBody>,
    res: Response
  ) {
    try {
      const product = await ProductService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async getAllProducts(req: Request, res: Response) {
    try {
      const products = await ProductService.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async getProductById(req: Request<{ id: string }>, res: Response) {
    try {
      const product = await ProductService.getProductById(req.params.id);
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
      const product = await ProductService.updateProduct(
        req.params.id,
        req.body
      );
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
      const product = await ProductService.deleteProduct(req.params.id);
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
