import { Role } from "../models/role-model";

async function initializeRoles() {
  const roles = [
    {
      name: "admin",
      permissions: [
        "create_products",
        "view_products",
        "update_products",
        "delete_products",
        "view_orders",
        "update_orders",
        "cancel_orders",
      ],
      description: "Administrator with full access to the system",
    },
    {
      name: "customer",
      permissions: [
        "view_products",
        "create_customer_order",
        "view_customer_orders",
        "cancel_customer_orders",
      ],
      description: "Regular customer with basic shopping privileges",
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
