import { Schema, model } from "mongoose";
import { ICategory, IProduct } from "../types/ProductTypes";

const categorySchema = new Schema({
  name: { type: String, required: true },
});

const reviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

const productSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  category: { type: Schema.Types.ObjectId, ref: "Category" },
  reviews: [reviewSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Category = model<ICategory>("Category", categorySchema);
const Product = model<IProduct>("Product", productSchema);

export { Category, Product };
