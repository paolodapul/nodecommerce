import { Types, Document } from "mongoose";
import { Request } from "express";

export interface IOrderItem {
  productId: Types.ObjectId;
  quantity: number;
  price: number;
  stripeProductId: string;
  stripePriceId: string;
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "completed";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderRequest extends Request {
  user?: {
    id: string;
  };
  body: CreateOrderBody;
}

export type OrderData = {
  userId: Types.ObjectId | string;
};

export type OrderId = string | Types.ObjectId;

export type OrderUpdateData = Partial<{
  items: IOrderItem[];
  status: IOrder["status"];
  totalAmount: IOrder["totalAmount"];
}>;

export type CreateOrderBody = OrderData;

export type UpdateOrderBody = OrderUpdateData;

export type OrderStatus = Pick<UpdateOrderBody, "status"> & {
  status: NonNullable<UpdateOrderBody["status"]>;
};
