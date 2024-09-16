import { Schema, model } from "mongoose";
import { ICart } from "../types/CartTypes";

const CartItemSchema: Schema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
});

const CartSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [CartItemSchema],
    totalAmount: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const Cart = model<ICart>("Cart", CartSchema);

export { Cart };
