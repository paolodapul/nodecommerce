import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  seller: mongoose.Types.ObjectId;
  stock: number;
  images: string[];
}

const ProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
      maxlength: [100, 'Product name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price must be a positive number'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: ['electronics', 'books', 'home', 'clothing', 'toys', 'other'],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stock: {
      type: Number,
      required: [true, 'Please add the stock quantity'],
      min: [0, 'Stock quantity must be a non-negative number'],
    },
    images: {
      type: [String],
      default: ['default.jpg'],
    },
    stripeProductId: { type: String },
    stripePriceId: { type: String },
  },
  {
    timestamps: true,
  },
);

export const ProductModel = mongoose.model<IProduct>('Product', ProductSchema);

export type StripeProduct = Pick<IProduct, 'name' | 'description' | 'price'>;
