import { Response } from "express";
import * as CartCore from "../core/cart";
import { CreateCartItemBody, UpdateProductBody } from "../types/cart-types";
import { AuthRequest } from "../types/auth-types";

export const addToCart = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (req.user) {
      await CartCore.addToCart(req.user.id, req.body as CreateCartItemBody);
      res.status(201).json({ message: "Item added to cart" });
    }
  } catch (error) {
    res.status(500).json({
      error: "Failed to add item to cart",
      message: (error as Error).message,
    });
  }
};

export const getCart = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (req.user) {
      const cart = await CartCore.getCart(req.user.id);
      res.json(cart);
    }
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve cart",
      message: (error as Error).message,
    });
  }
};

export const updateCartItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (req.user) {
      await CartCore.updateCartItem(
        req.user.id,
        req.params.productId,
        (req.body as UpdateProductBody).quantity as number
      );
      res.json({ message: "Cart item updated" });
    }
  } catch (error) {
    res.status(500).json({
      error: "Failed to update cart item",
      message: (error as Error).message,
    });
  }
};

export const removeFromCart = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (req.user) {
      await CartCore.removeFromCart(req.user.id, req.params.productId);
      res.json({ message: "Item removed from cart" });
    }
  } catch (error) {
    res.status(500).json({
      error: "Failed to remove item from cart",
      message: (error as Error).message,
    });
  }
};
