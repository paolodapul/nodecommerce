import { Role } from "../models/role-model";

async function initializeRoles() {
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
        "view_orders",
        "update_orders",
        "cancel_orders",
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
        // Order management (customer)
        "create_customer_order",
        "view_customer_orders",
        "cancel_customer_orders",
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
      console.log(`Role ${role.name} initialized successfully`);
    } catch (error) {
      console.error(`Error initializing role ${role.name}:`, error);
    }
  }
}

export { initializeRoles };
