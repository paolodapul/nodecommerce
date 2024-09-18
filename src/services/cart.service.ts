import { CartModel, ICart, ICartItem } from '../models/cart.model';
import { ProductModel } from '../models/product.model';
import ApiError from '../utils/apiError';
import mongoose from 'mongoose';

const populateCart = (cart: ICart) =>
  cart.populate({
    path: 'items.product',
    select: 'name price stock'
  });

const getCartQuery = (userId?: string, sessionId?: string) => {
  if (userId) return { user: userId };
  if (sessionId) return { sessionId };
  throw new ApiError(400, 'User ID or Session ID is required');
};

export const getCart = async (userId?: string, sessionId?: string): Promise<ICart> => {
  const query = getCartQuery(userId, sessionId);
  let cart = await CartModel.findOne(query);
  if (!cart) {
    const newCarts = await CartModel.create([query]);
    cart = newCarts[0];
  }
  return populateCart(cart);
};

export const addToCart = async (userId: string | undefined, sessionId: string | undefined, productId: string, quantity: number): Promise<ICart> => {
  try {
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // We check stock availability but don't reduce it
    if (product.stock < quantity) {
      throw new ApiError(400, 'Requested quantity exceeds available stock');
    }

    const query = userId ? { user: userId } : { sessionId };
    let cart = await CartModel.findOne(query);

    if (!cart) {
      cart = new CartModel({ ...query, items: [] });
    }

    const cartItemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (cartItemIndex > -1) {
      cart.items[cartItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId as any, quantity });
    }

    await cart.save();

    return populateCart(cart);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'An error occurred while adding to cart');
  }
};

export const removeFromCart = async (userId: string | undefined, sessionId: string | undefined, productId: string): Promise<ICart> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const query = getCartQuery(userId, sessionId);
    const cart = await CartModel.findOne(query).session(session);
    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }

    const cartItemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (cartItemIndex === -1) {
      throw new ApiError(404, 'Item not found in cart');
    }

    const removedQuantity = cart.items[cartItemIndex].quantity;
    cart.items.splice(cartItemIndex, 1);

    await cart.save({ session });

    await ProductModel.findByIdAndUpdate(productId, { $inc: { stock: removedQuantity } }, { session });

    await session.commitTransaction();
    return populateCart(cart);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const updateCartItemQuantity = async (userId: string | undefined, sessionId: string | undefined, productId: string, quantity: number): Promise<ICart> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const query = getCartQuery(userId, sessionId);
    const cart = await CartModel.findOne(query).session(session);
    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }

    const cartItemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (cartItemIndex === -1) {
      throw new ApiError(404, 'Item not found in cart');
    }

    const product = await ProductModel.findById(productId).session(session);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    const quantityDifference = quantity - cart.items[cartItemIndex].quantity;

    if (product.stock < quantityDifference) {
      throw new ApiError(400, 'Not enough stock');
    }

    cart.items[cartItemIndex].quantity = quantity;

    await cart.save({ session });

    await ProductModel.findByIdAndUpdate(productId, { $inc: { stock: -quantityDifference } }, { session });

    await session.commitTransaction();
    return populateCart(cart);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const clearCart = async (userId: string | undefined, sessionId: string | undefined): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const query = getCartQuery(userId, sessionId);
    const cart = await CartModel.findOne(query).session(session);
    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }

    for (const item of cart.items) {
      await ProductModel.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } }, { session });
    }

    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getCartTotal = async (userId: string | undefined, sessionId: string | undefined): Promise<number> => {
  const query = getCartQuery(userId, sessionId);
  const cart = await CartModel.findOne(query).populate('items.product', 'price');
  if (!cart) {
    return 0;
  }

  return cart.items.reduce((total, item) => {
    const product = item.product as any;
    return total + (product.price * item.quantity);
  }, 0);
};
