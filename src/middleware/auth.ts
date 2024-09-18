import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import ApiError from '../utils/apiError';
import { UserModel } from '../models/user.model';
import { ProductModel } from '../models/product.model';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized to access this route'));
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    req.user = await UserModel.findById((decoded as any).id);

    next();
  } catch (error) {
    return next(new ApiError(401, 'Not authorized to access this route'));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authorized to access this route'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, `User role ${req.user.role} is not authorized to access this route`));
    }
    next();
  };
};

export const checkProductOwnership = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.id;
    const userId = req.user!.id;

    const product = await ProductModel.findById(productId);

    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    if (product.seller.toString() !== userId) {
      return next(new ApiError(403, 'Not authorized to modify this product'));
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const optionalProtect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    req.user = await UserModel.findById((decoded as any).id);
    next();
  } catch (error) {
    next();
  }
};
