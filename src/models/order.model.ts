import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product:
    | mongoose.Types.ObjectId
    | {
        _id: mongoose.Types.ObjectId;
        name: string;
        price: number;
        seller: mongoose.Types.ObjectId;
      };
  quantity: number;
  price: number;
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'completed';

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalPrice: number;
  shippingFee: number;
  finalPrice: number;
  status: OrderStatus;
  shippingAddress: string;
  paymentInfo: {
    id: string;
    status: string;
    type: string;
  };
  paidAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity cannot be less than 1'],
        },
        price: {
          type: Number,
          required: true,
          min: [0, 'Price cannot be negative'],
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative'],
    },
    shippingFee: {
      type: Number,
      required: true,
      min: [0, 'Shipping fee cannot be negative'],
    },
    finalPrice: {
      type: Number,
      required: true,
      min: [0, 'Final price cannot be negative'],
    },
    status: {
      type: String,
      required: true,
      enum: [
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'completed',
      ],
      default: 'pending',
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    paymentInfo: {
      id: {
        type: String,
      },
      status: {
        type: String,
      },
      type: {
        type: String,
      },
    },
    paidAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export const OrderModel = mongoose.model<IOrder>('Order', OrderSchema);
