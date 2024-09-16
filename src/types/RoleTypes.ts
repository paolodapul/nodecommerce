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

export interface IRole extends Document {
  name: string;
  permissions: Permission[];
  description?: string;
  createdAt: Date;
}
