import { Request, Response, NextFunction } from 'express';
import { ProductModel, IProduct } from '../models/product.model';
import { AuthRequest } from '../middleware/auth';
import ApiError from '../utils/apiError';

export const createProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const seller = req.user!.id;
    // Handle file upload
    let images: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      images = (req.files as Express.Multer.File[]).map((file) => file.path);
    }

    const product = await ProductModel.create({
      ...req.body,
      seller,
      images,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const products = await ProductModel.find().populate('seller', 'name email');
    res
      .status(200)
      .json({ success: true, count: products.length, data: products });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await ProductModel.findById(req.params.id).populate(
      'seller',
      'name email',
    );
    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Note: We don't need to check ownership here because it's handled by the middleware
    let product = await ProductModel.findById(req.params.id);

    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    // Handle file upload
    let images: string[] = product.images;
    if (req.files && Array.isArray(req.files)) {
      const newImages = (req.files as Express.Multer.File[]).map(
        (file) => file.path,
      );
      images = [...images, ...newImages];
    }

    product = await ProductModel.findByIdAndUpdate(
      req.params.id,
      { ...req.body, images },
      { new: true, runValidators: true },
    );

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Note: We don't need to check ownership here because it's handled by the middleware
    const product = await ProductModel.findByIdAndDelete(req.params.id);

    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

export const getSellerProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const products = await ProductModel.find({ seller: req.user!.id }).populate(
      'seller',
      'name email',
    );
    res
      .status(200)
      .json({ success: true, count: products.length, data: products });
  } catch (error) {
    next(error);
  }
};
