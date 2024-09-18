import { Types } from "mongoose";
import { Order } from "../models/order-model";
import {
  IOrder,
  IOrderDocument,
  OrderData,
  OrderId,
  OrderUpdateData,
} from "../types/order-types";
import * as CartCore from "../core/cart";
import logger from "../utils/logger";

class OrderService {
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
    userId: string | Types.ObjectId,
    page: number = 1,
    limit: number = 10
  ) {
    try {
      const skip = (page - 1) * limit;

      const orders = await Order.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
          },
        },
        {
          $addFields: {
            sortOrder: {
              $cond: { if: { $eq: ["$status", "pending"] }, then: 0, else: 1 },
            },
          },
        },
        {
          $sort: {
            sortOrder: 1,
            updatedAt: -1,
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ]);

      const totalOrders = await Order.countDocuments({
        userId: new Types.ObjectId(userId),
      });

      return {
        orders,
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
      };
    } catch (error) {
      logger.error("Error fetching sorted user orders:", error);
      throw error;
    }
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
