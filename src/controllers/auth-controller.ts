import { Request, Response } from "express";
import { z } from "zod";
import { User } from "../models/user-model";
import { verifyPassword, hashPassword } from "../utils/hashing";
import jwt from "jsonwebtoken";
import { Role } from "../models/role-model";

const loginSchema = z
  .object({
    username: z.string(),
    password: z.string().min(8),
  })
  .strict();

type LoginBody = z.infer<typeof loginSchema>;

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

type RegisterBody = z.infer<typeof registerSchema>;

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const result = registerSchema.safeParse(req.body);

      if (!result.success) {
        const errorMessages = result.error.flatten().fieldErrors;
        return res.status(400).json({ errors: errorMessages });
      }

      const { username, email, password } = req.body as RegisterBody;
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

      res.status(200).json({ description: "Registration successful!" });
    } catch (error) {
      res.status(500).json({
        error: "Registration failed",
        message: (error as Error).message,
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = loginSchema.safeParse(req.body);

      if (!result.success) {
        throw new Error("Incorrect username or password.");
      }

      const userData = req.body as LoginBody;

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

      const token = jwt.sign(
        { id: user?._id, role: user?.roles[0] },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "1h",
        }
      );

      res.status(200).json({ description: "Log in successful.", token });
    } catch (error) {
      res.status(500).json({
        error: "Login failed",
        message: (error as Error).message,
      });
    }
  }
}

export default new AuthController();
