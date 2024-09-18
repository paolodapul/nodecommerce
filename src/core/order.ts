import { Types } from "mongoose";
import { Order } from "../models/order-model";
import {
  IOrder,
  OrderData,
  OrderId,
  OrderUpdateData,
} from "../types/order-types";
import * as CartCore from "../core/cart";
import logger from "../utils/logger";
import { InternalServerErrorException } from "../types/error-types";

export const createOrder = async (orderData: OrderData) => {
  const { items } = await CartCore.getCart(orderData.userId as string);

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (items.length === 0) {
    throw new InternalServerErrorException(
      "Cannot create order with empty cart!"
    );
  }

  const order = new Order({
    userId: orderData.userId,
    items,
    totalAmount,
    status: "pending",
  });
  return await order.save();
};

export const getAllOrders = async () => {
  return await Order.find();
};

export const getOrderById = async (
  id: string | Types.ObjectId
): Promise<IOrder> => {
  return await Order.findById(id).orFail(
    () => new Error(`Order not found with id ${id as string}`)
  );
};

export const getOrdersByUserId = async (
  userId: string | Types.ObjectId,
  page: number = 1,
  limit: number = 10
) => {
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
};

export const updateOrder = async (id: OrderId, updateData: OrderUpdateData) => {
  let update = { ...updateData };
  if (updateData.items) {
    const totalAmount = updateData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    update = { ...update, totalAmount };
  }
  return await Order.findByIdAndUpdate(id, update, { new: true });
};

export const updateOrderStatus = async (
  id: OrderId,
  status: IOrder["status"]
) => {
  return await Order.findByIdAndUpdate(id, { status }, { new: true });
};

export const cancelOrder = async (id: OrderId) => {
  return await updateOrderStatus(id, "cancelled");
};
