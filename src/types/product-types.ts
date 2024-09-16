import { Document, Types } from "mongoose";

export interface ICategory extends Document {
  name: string;
}

export interface IReview {
  user: Types.ObjectId;
  message?: string;
  rating: number;
}

export interface IProduct extends Document {
  name: string;
  price: number;
  description: string;
  category: Types.ObjectId;
  reviews: IReview[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceFilter {
  $gte?: number;
  $lte?: number;
}
