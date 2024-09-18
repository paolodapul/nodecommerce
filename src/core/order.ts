import { Types } from "mongoose";
import { Order } from "../models/order-model";
import {
  IOrder,
  IOrderDocument,
  IOrderService,
  OrderData,
  OrderId,
  OrderUpdateData,
} from "../types/order-types";
import * as CartCore from "../core/cart";

class OrderService implements IOrderService {
  async createOrder(orderData: OrderData): Promise<IOrderDocument> {
    const { items } = await CartCore.getCart(orderData.userId as string);

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = new Order({
      userId: orderData.userId,
      items,
      totalAmount,
      status: "pending",
    });
    return await order.save();
  }

  async getAllOrders(): Promise<IOrderDocument[]> {
    return await Order.find();
  }

  async getOrderById(id: OrderId): Promise<IOrderDocument | null> {
    return await Order.findById(id);
  }

  async getOrdersByUserId(
    userId: string | Types.ObjectId
  ): Promise<IOrderDocument[]> {
    return await Order.find({ userId: new Types.ObjectId(userId) });
  }

  async updateOrder(
    id: OrderId,
    updateData: OrderUpdateData
  ): Promise<IOrderDocument | null> {
    let update = { ...updateData };
    if (updateData.items) {
      const totalAmount = updateData.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      update = { ...update, totalAmount };
    }
    return await Order.findByIdAndUpdate(id, update, { new: true });
  }

  async updateOrderStatus(
    id: OrderId,
    status: IOrder["status"]
  ): Promise<IOrderDocument | null> {
    return await Order.findByIdAndUpdate(id, { status }, { new: true });
  }

  async cancelOrder(id: OrderId): Promise<IOrderDocument | null> {
    return await this.updateOrderStatus(id, "cancelled");
  }
}

export default new OrderService();
