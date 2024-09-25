import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as cartService from '../services/cart.service';

const getIdentifiers = (req: AuthRequest | Request) => {
  const userId = (req as AuthRequest).user?.id;
  const sessionId = req.headers['x-session-id'] as string;
  return { userId, sessionId };
};

export const getCartController = async (
  req: AuthRequest | Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, sessionId } = getIdentifiers(req);
    const cart = await cartService.getCart(userId, sessionId);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

export const addToCartController = async (
  req: AuthRequest | Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, sessionId } = getIdentifiers(req);
    const { productId, quantity } = req.body;
    const cart = await cartService.addToCart(
      userId,
      sessionId,
      productId,
      quantity,
    );
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

export const removeFromCartController = async (
  req: AuthRequest | Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, sessionId } = getIdentifiers(req);
    const { productId } = req.params;
    const cart = await cartService.removeFromCart(userId, sessionId, productId);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

export const updateCartItemQuantityController = async (
  req: AuthRequest | Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, sessionId } = getIdentifiers(req);
    const { productId } = req.params;
    const { quantity } = req.body;
    const cart = await cartService.updateCartItemQuantity(
      userId,
      sessionId,
      productId,
      quantity,
    );
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

export const clearCartController = async (
  req: AuthRequest | Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, sessionId } = getIdentifiers(req);
    await cartService.clearCart(userId, sessionId);
    res
      .status(200)
      .json({ success: true, message: 'Cart cleared successfully' });
  } catch (error) {
    next(error);
  }
};

export const getCartTotalController = async (
  req: AuthRequest | Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, sessionId } = getIdentifiers(req);
    const total = await cartService.getCartTotal(userId, sessionId);
    res.status(200).json({ success: true, data: { total } });
  } catch (error) {
    next(error);
  }
};
