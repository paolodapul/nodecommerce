import { NextFunction, Request, Response } from "express";
import {
  CreateProductInput,
  createProductSchema,
  CreateReviewInput,
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
import * as ProductCore from "../core/product";
import { AuthRequest } from "../types/auth-types";

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validationResult = validate(createProductSchema, req.body);
    if (!validationResult.success) {
      throw new BadRequestException(validationResult.errors);
    }
    await ProductCore.createProduct(req.body as CreateProductInput);
    res.status(201).json({ message: "Product created." });
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validationResult = validate(getProductsSchema, req.query);
    if (!validationResult.success) {
      throw new BadRequestException(validationResult.errors);
    }
    const products = await ProductCore.getAllProducts(
      validationResult.data as GetProductQueryParams
    );
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validationResult = validate(getProductByIdSchema, req.params);
    if (!validationResult.success) {
      throw new BadRequestException(validationResult.errors);
    }
    const product = await ProductCore.getProductById(
      req.params as GetProductByIdParams
    );
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validationResult = validate(updateProductSchema, req.body);
    if (!validationResult.success) {
      throw new BadRequestException(validationResult.errors);
    }
    const product = await ProductCore.updateProduct(
      req.params.id,
      validationResult.data as UpdateProductInput
    );
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validationResult = validate(deleteProductByIdSchema, req.params);
    if (!validationResult.success) {
      throw new BadRequestException(validationResult.errors);
    }
    const product = await ProductCore.deleteProduct(
      req.params as DeleteProductByIdParams
    );
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

export const addReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    let product;

    if (userId) {
      product = await ProductCore.addReview(
        userId,
        id,
        req.body as CreateReviewInput
      );
    }

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};
