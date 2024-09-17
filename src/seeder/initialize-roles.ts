import { Role } from "../models/role-model";
import logger from "../utils/logger";

async function initializeRoles() {
  await Role.deleteMany({});

  const roles = [
    {
      name: "admin",
      permissions: [
        // Product management
        "create_products",
        "view_products",
        "update_products",
        "delete_products",
        // Order management
        "view_any_order",
        "update_any_order",
        "cancel_any_order",
        // Cart management (admin)
        "view_any_cart",
        "modify_any_cart",
        "clear_any_cart",
      ],
      description: "Administrator with full access to the system",
    },
    {
      name: "customer",
      permissions: [
        // Product interaction
        "view_products",
        "create_review",
        // Order management (customer)
        "create_order",
        "update_order",
        "view_orders",
        "cancel_orders",
        // Cart management (customer)
        "view_cart",
        "add_to_cart",
        "update_cart",
        "remove_from_cart",
        "clear_cart",
        "checkout_cart",
      ],
      description:
        "Regular customer with shopping and cart management privileges",
    },
  ];

  for (const role of roles) {
    try {
      await Role.findOneAndUpdate({ name: role.name }, role, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      });
      logger.info(`Role ${role.name} initialized successfully`);
    } catch (error) {
      logger.error(`Error initializing role ${role.name}:`, error);
    }
  }
}

export { initializeRoles };
