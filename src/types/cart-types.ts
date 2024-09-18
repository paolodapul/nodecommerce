import { Types, Document } from "mongoose";

export interface ICartItem {
  productId: Types.ObjectId;
  quantity: number;
  price: number;
  stripeProductId: string;
  stripePriceId: string;
}

export interface ICart extends Document {
  userId: Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateCartItemBody = Omit<ICartItem, "id">;
export type UpdateProductBody = Partial<CreateCartItemBody>;
