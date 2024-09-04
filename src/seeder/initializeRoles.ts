import { Role } from "../models/roleModel";

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
    },
    {
      name: "customer",
      permissions: [
        "view_products",
        "create_customer_order",
        "view_customer_orders",
        "cancel_customer_orders",
      ],
    },
  ];

  for (const role of roles) {
    await Role.findOneAndUpdate({ name: role.name }, role, {
      upsert: true,
      new: true,
    });
  }

  console.log("Roles initialized");
}

export { initializeRoles };
