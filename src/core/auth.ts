import { z } from "zod";
import { Request } from "express";
import { hashPassword } from "../utils/hashing";
import { Role } from "../models/role-model";
import { User } from "../models/user-model";

// const loginSchema = z
//   .object({
//     username: z.string(),
//     password: z.string().min(8),
//   })
//   .strict();

// type LoginBody = z.infer<typeof loginSchema>;

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters long")
      .max(30, "Username must not exceed 30 characters")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Username can only contain letters, numbers, underscores, and hyphens"
      )
      .refine(
        (username) => !username.startsWith("-") && !username.endsWith("-"),
        "Username cannot start or end with a hyphen"
      ),
    email: z.string().email(),
    password: z.string().min(8),
  })
  .strict();

export type RegisterBody = z.infer<typeof registerSchema>;

export function validateRegistrationRequest(request: Request) {
  const result = registerSchema.safeParse(request.body);
  if (!result.success) {
    throw new Error(
      `Validation failed: ${JSON.stringify(result.error.errors)}`
    );
  }
}

export async function createCustomer(registerBody: RegisterBody) {
  const { username, email, password } = registerBody;
  const hashedPassword = await hashPassword(password);

  const customerPermissions = [
    "create_order",
    "view_orders",
    "update_orders",
    "cancel_orders",
    "add_to_cart",
    "view_cart",
    "update_cart",
    "remove_from_cart",
    "create_review",
  ];

  const customerRoles = await Role.find({
    permissions: { $in: customerPermissions },
  });

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    roles: customerRoles,
  });
  await newUser.save();
}
