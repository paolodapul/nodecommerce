import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  order: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: string;
  paymentType: string;
  status: string;
  transactionId: string;
  currency: string;
  refundedAmount?: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative'],
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentType: {
      type: String,
      required: true,
      enum: [
        'credit_card',
        'card',
        'debit_card',
        'paypal',
        'bank_transfer',
        'other',
      ],
    },
    status: {
      type: String,
      required: true,
      enum: [
        'pending',
        'succeeded',
        'failed',
        'refunded',
        'partially_refunded',
      ],
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },
    refundedAmount: {
      type: Number,
      min: [0, 'Refunded amount cannot be negative'],
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient querying
PaymentSchema.index({ order: 1, transactionId: 1 });

export const PaymentModel = mongoose.model<IPayment>('Payment', PaymentSchema);
