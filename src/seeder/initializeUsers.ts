import { Role } from "../models/role-model";
import { User } from "../models/user-model";

import { hashPassword } from "../utils/hashing";

async function initializeUsers() {
  try {
    await User.deleteMany({});

    const customerRole = await Role.findOne({ name: "customer" });
    const adminRole = await Role.findOne({ name: "admin" });

    if (!customerRole || !adminRole) {
      throw new Error(
        "Required roles not found. Please run role seeder first."
      );
    }

    const users = [
      {
        username: "johndoe",
        email: "john@example.com",
        password: "password123",
        roles: [customerRole._id],
      },
      {
        username: "adminuser",
        email: "admin@example.com",
        password: "adminpass789",
        roles: [adminRole._id],
      },
    ];

    for (const user of users) {
      const hashedPassword = await hashPassword(user.password);
      await User.create({
        ...user,
        password: hashedPassword,
      });
    }

    console.log("Users seeded successfully");
  } catch (error) {
    console.error("Error seeding users:", error);
  }
}

export { initializeUsers };
