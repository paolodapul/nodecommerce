import { Types, Document } from "mongoose";

export interface ICartItem {
  productId: Types.ObjectId;
  quantity: number;
  price: number;
}

export interface ICart extends Document {
  userId: Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}
