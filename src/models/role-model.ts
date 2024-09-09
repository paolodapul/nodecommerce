import mongoose from "mongoose";

export const VALID_PERMISSIONS = [
  "create_products",
  "view_products",
  "update_products",
  "delete_products",
  "view_orders",
  "update_orders",
  "cancel_orders",
  "create_customer_order",
  "view_customer_orders",
  "cancel_customer_orders",
] as const;

export type Permission = (typeof VALID_PERMISSIONS)[number];

interface IRole extends Document {
  name: string;
  permissions: Permission[];
  description?: string;
}

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  permissions: [
    {
      type: [String],
      enum: VALID_PERMISSIONS,
      required: true,
      validate: [
        {
          validator: (array: Permission[]) => array.length > 0,
          message: "At least one permission is required.",
        },
        {
          validator: (array: Permission[]) =>
            array.every((v) => VALID_PERMISSIONS.includes(v)),
          message: "Invalid permission value.",
        },
      ],
    },
  ],
  description: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Role = mongoose.model<IRole>("Role", roleSchema);

export { Role };
