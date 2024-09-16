import { z } from "zod";
import { Request } from "express";
import { hashPassword, verifyPassword } from "../utils/hashing";
import { Role } from "../models/role-model";
import { User } from "../models/user-model";
import { IUser } from "../types/UserTypes";
import jwt from "jsonwebtoken";
import { TokenBody } from "../types/AuthTypes";

const loginSchema = z
  .object({
    username: z.string(),
    password: z.string().min(8),
  })
  .strict();

export type LoginBody = z.infer<typeof loginSchema>;

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

export function validateLoginRequest(request: Request) {
  const result = loginSchema.safeParse(request.body);
  if (!result.success) {
    throw new Error(
      `Validation failed: ${JSON.stringify(result.error.errors)}`
    );
  }
}

export async function verifyUser(
  userData: Pick<IUser, "username" | "password">
): Promise<TokenBody> {
  const { username, password } = userData;
  let userFound, matchesPassword;

  const user = await User.findOne({ username });

  if (user) {
    userFound = true;
    matchesPassword = await verifyPassword(password, user.password);
  }

  if (!userFound || !matchesPassword) {
    throw new Error("Incorrect username or password.");
  }

  if (user && "_id" in user && "roles" in user) {
    return {
      _id: user._id,
      roles: user.roles,
    };
  } else {
    throw new Error(
      "There was a problem with fetching the ID and roles of user."
    );
  }
}

export function generateToken(user: TokenBody) {
  return jwt.sign(
    { id: user?._id, role: user?.roles[0] },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1h",
    }
  );
}
