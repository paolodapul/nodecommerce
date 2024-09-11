/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from "express";
import CartService from "../services/cart-service";
import { Product } from "../models/product-model";
import Cart, { ICart, ICartItem } from "../models/cart-model";
import { Types } from "mongoose";

export type CreateCartItemBody = Omit<ICartItem, "id">;
type UpdateProductBody = Partial<CreateCartItemBody>;

export async function getCart(userId: string): Promise<ICart> {
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  try {
    let cart = await Cart.findOne({ userId: new Types.ObjectId(userId) });

    if (!cart) {
      // If no cart exists, create a new empty cart
      cart = new Cart({
        userId: new Types.ObjectId(userId),
        items: [],
        totalAmount: 0,
      });
      await cart.save();
    }

    return cart;
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error in getCart:", error);
    throw new Error("Failed to retrieve cart");
  }
}

export async function addToCart(
  userId: string,
  item: Omit<ICartItem, "price">
): Promise<void> {
  const product = await Product.findById(item.productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const cart = await getCart(userId);
  if (cart) {
    const existingItem = cart.items.find(
      (i: { productId: { toString: () => string } }) =>
        i.productId.toString() === item.productId.toString()
    );
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cart.items.push({ ...item, price: product.price });
    }
    cart.totalAmount += product.price * item.quantity;
    await cart.save();
  } else {
    await Cart.create({
      userId: new Types.ObjectId(userId),
      items: [{ ...item, price: product.price }],
      totalAmount: product.price * item.quantity,
    });
  }
}

class CartController {
  async addToCart(
    req: Request<{ userId: string }, object, CreateCartItemBody>,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.params.userId;
      const item = req.body;
      await addToCart(userId, item);
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
      const cart = await getCart(req.params.userId);
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
