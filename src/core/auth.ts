import { Request } from "express";
import { hashPassword, verifyPassword } from "../utils/hashing";
import { Role } from "../models/role-model";
import { User } from "../models/user-model";
import { IUser } from "../types/user-types";
import jwt from "jsonwebtoken";
import { TokenBody } from "../types/auth-types";
import { loginSchema, RegisterInput } from "../schemas/auth-schema";

export async function createCustomer(registerBody: RegisterInput) {
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
