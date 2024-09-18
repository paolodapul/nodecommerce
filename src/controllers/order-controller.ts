import { NextFunction, Request, Response } from "express";
import OrderCore from "../core/order";
import {
  CreateOrderRequest,
  OrderStatus,
  UpdateOrderBody,
} from "../types/order-types";
import {
  InternalServerErrorException,
  UnauthorizedException,
} from "../types/error-types";
import * as CartCore from "../core/cart";
import { AuthRequest } from "../types/auth-types";

export const createOrder = async (
  req: CreateOrderRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedException("User is not authenticated.");
    }

    const order = await OrderCore.createOrder({
      userId: req.user?.id,
    });

    if (!order) {
      throw new InternalServerErrorException("Order creation failed.");
    }

    await CartCore.clearUserCart(req.user.id);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const order = await OrderCore.getOrderById(orderId);
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve order",
      message: (error as Error).message,
    });
  }
};

export const getUserOrders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedException("User is not authorized.");
    }

    const orders = await OrderCore.getOrdersByUserId(req.user.id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve user orders",
      message: (error as Error).message,
    });
  }
};

export const updateOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const updateData = req.body as UpdateOrderBody;
    const updatedOrder = await OrderCore.updateOrder(orderId, updateData);
    if (updatedOrder) {
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({
      error: "Failed to update order",
      message: (error as Error).message,
    });
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { status } = req.body as OrderStatus;
    const updatedOrder = await OrderCore.updateOrderStatus(orderId, status);
    if (updatedOrder) {
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({
      error: "Failed to update order status",
      message: (error as Error).message,
    });
  }
};

export const cancelOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const cancelledOrder = await OrderCore.cancelOrder(orderId);
    if (cancelledOrder) {
      res.json(cancelledOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({
      error: "Failed to cancel order",
      message: (error as Error).message,
    });
  }
};
