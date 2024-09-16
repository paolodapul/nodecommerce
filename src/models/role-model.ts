import { model, Schema, Document } from "mongoose";

export const VALID_PERMISSIONS = [
  // Product management
  "create_products",
  "view_products",
  "update_products",
  "delete_products",
  "create_review",
  // Order management (admin)
  "view_any_order",
  "update_any_order",
  "cancel_any_order",
  // Order management (customer)
  "create_order",
  "view_orders",
  "update_orders",
  "cancel_orders",
  // Cart management
  "add_to_cart",
  "view_cart",
  "update_cart",
  "remove_from_cart",
] as const;

export type Permission = (typeof VALID_PERMISSIONS)[number];

interface IRole extends Document {
  name: string;
  permissions: Permission[];
  description?: string;
  createdAt: Date;
}

const roleSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  permissions: {
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
  description: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Role = model<IRole>("Role", roleSchema);

export { Role };
