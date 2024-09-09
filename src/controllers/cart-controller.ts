import { Request, Response } from "express";
import CartService from "../services/cartService";
import { ICartItem } from "../models/cart-model";

export type CreateCartItemBody = Omit<ICartItem, "id">;
type UpdateProductBody = Partial<CreateCartItemBody>;

class CartController {
  async addToCart(
    req: Request<{ userId: string }, object, CreateCartItemBody>,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.params.userId;
      const item = req.body;
      await CartService.addToCart(userId, item);
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
      const cart = await CartService.getCart(req.params.userId);
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
      await CartService.updateCartItem(userId, productId, quantity as number);
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
      await CartService.removeFromCart(userId, productId);
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
