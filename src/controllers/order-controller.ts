import { Request, Response } from "express";
import OrderService, {
  OrderData,
  OrderUpdateData,
} from "../services/order-service";
import { IOrder } from "../models/order-model";

interface CreateOrderRequest extends Request {
  user?: {
    id: string;
  };
  body: CreateOrderBody;
}

export type CreateOrderBody = OrderData;
type UpdateOrderBody = OrderUpdateData;

class OrderController {
  async createOrder(req: CreateOrderRequest, res: Response): Promise<void> {
    try {
      const orderData = req.body;
      const order = await OrderService.createOrder({
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
  }

  async getOrder(
    req: Request<{ orderId: string }>,
    res: Response
  ): Promise<void> {
    try {
      const { orderId } = req.params;
      const order = await OrderService.getOrderById(orderId);
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
  }

  async getUserOrders(
    req: Request<{ userId: string }>,
    res: Response
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const orders = await OrderService.getOrdersByUserId(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({
        error: "Failed to retrieve user orders",
        message: (error as Error).message,
      });
    }
  }

  async updateOrder(
    req: Request<{ orderId: string }, object, UpdateOrderBody>,
    res: Response
  ): Promise<void> {
    try {
      const { orderId } = req.params;
      const updateData = req.body;
      const updatedOrder = await OrderService.updateOrder(orderId, updateData);
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
  }

  async updateOrderStatus(
    req: Request<{ orderId: string }, object, { status: IOrder["status"] }>,
    res: Response
  ): Promise<void> {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      const updatedOrder = await OrderService.updateOrderStatus(
        orderId,
        status
      );
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
  }

  async cancelOrder(
    req: Request<{ orderId: string }>,
    res: Response
  ): Promise<void> {
    try {
      const { orderId } = req.params;
      const cancelledOrder = await OrderService.cancelOrder(orderId);
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
  }
}

export default new OrderController();
