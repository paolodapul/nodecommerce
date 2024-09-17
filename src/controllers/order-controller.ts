import { Request, Response } from "express";
import OrderCore from "../core/order";
import {
  CreateOrderRequest,
  OrderStatus,
  UpdateOrderBody,
} from "../types/order-types";

export const createOrder = async (
  req: CreateOrderRequest,
  res: Response
): Promise<void> => {
  try {
    const orderData = req.body;
    const order = await OrderCore.createOrder({
      ...orderData,
      userId: req.user?.id as string,
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({
      error: "Failed to create order",
      message: (error as Error).message,
    });
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
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const orders = await OrderCore.getOrdersByUserId(userId);
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
