import { Document, Types } from "mongoose";
import { Order, IOrder, IOrderItem } from "../models/order-model";
import cartService from "./cart-service";

export interface IOrderDocument extends IOrder, Document {}

export type OrderData = {
  userId: Types.ObjectId | string;
  items: IOrderItem[];
};

export type OrderId = string | Types.ObjectId;

export type OrderUpdateData = Partial<{
  items: IOrderItem[];
  status: IOrder["status"];
  totalAmount: IOrder["totalAmount"];
}>;

export interface IOrderService {
  createOrder(orderData: OrderData): Promise<IOrderDocument>;
  getAllOrders(): Promise<IOrderDocument[]>;
  getOrderById(id: OrderId): Promise<IOrderDocument | null>;
  getOrdersByUserId(userId: string | Types.ObjectId): Promise<IOrderDocument[]>;
  updateOrder(
    id: OrderId,
    updateData: OrderUpdateData
  ): Promise<IOrderDocument | null>;
  updateOrderStatus(
    id: OrderId,
    status: IOrder["status"]
  ): Promise<IOrderDocument | null>;
  cancelOrder(id: OrderId): Promise<IOrderDocument | null>;
}

class OrderService implements IOrderService {
  async createOrder(orderData: OrderData): Promise<IOrderDocument> {
    // Fetch user cart
    const { items } = await cartService.getCart(orderData.userId as string);

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = new Order({
      userId: orderData.userId,
      items,
      totalAmount,
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
