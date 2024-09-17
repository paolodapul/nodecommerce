import { Cart } from "../models/cart-model";
import { Product } from "../models/product-model";
import { ICart, ICartItem } from "../types/cart-types";
import { Types } from "mongoose";

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

export async function updateCartItem(
  userId: string,
  productId: string,
  quantity: number
): Promise<void> {
  const cart = await getCart(userId);
  if (!cart) throw new Error("Cart not found");

  const item = cart.items.find((i) => i.productId.toString() === productId);
  if (!item) throw new Error("Item not found in cart");

  const quantityDiff = quantity - item.quantity;
  const amountDiff = quantityDiff * item.price;

  item.quantity = quantity;
  cart.totalAmount += amountDiff;

  await cart.save();
}

export async function removeFromCart(
  userId: string,
  productId: string
): Promise<void> {
  const cart = await getCart(userId);
  if (!cart) throw new Error("Cart not found");

  const itemIndex = cart.items.findIndex(
    (i) => i.productId.toString() === productId
  );
  if (itemIndex === -1) throw new Error("Item not found in cart");

  const item = cart.items[itemIndex];
  cart.totalAmount -= item.price * item.quantity;
  cart.items.splice(itemIndex, 1);

  await cart.save();
}
