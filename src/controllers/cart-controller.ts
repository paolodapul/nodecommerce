import { Request, Response } from "express";
import * as CartCore from "../core/cart";
import { CreateCartItemBody, UpdateProductBody } from "../types/cart-types";

class CartController {
  async addToCart(
    req: Request<{ userId: string }, object, CreateCartItemBody>,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.params.userId;
      const item = req.body;
      await CartCore.addToCart(userId, item);
      res.status(201).json({ message: "Item added to cart" });
    } catch (error) {
      res.status(500).json({
        error: "Failed to add item to cart",
        message: (error as Error).message,
      });
    }
  }

  async getCart(req: Request, res: Response): Promise<void> {
    try {
      const cart = await CartCore.getCart(req.params.userId);
      res.json(cart);
    } catch (error) {
      res.status(500).json({
        error: "Failed to retrieve cart",
        message: (error as Error).message,
      });
    }
  }

  async updateCartItem(
    req: Request<
      { userId: string; productId: string },
      object,
      UpdateProductBody
    >,
    res: Response
  ): Promise<void> {
    try {
      const { userId, productId } = req.params;
      const { quantity } = req.body;
      await CartCore.updateCartItem(userId, productId, quantity as number);
      res.json({ message: "Cart item updated" });
    } catch (error) {
      res.status(500).json({
        error: "Failed to update cart item",
        message: (error as Error).message,
      });
    }
  }

  async removeFromCart(req: Request, res: Response): Promise<void> {
    try {
      const { userId, productId } = req.params;
      await CartCore.removeFromCart(userId, productId);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({
        error: "Failed to remove item from cart",
        message: (error as Error).message,
      });
    }
  }
}

export default new CartController();
