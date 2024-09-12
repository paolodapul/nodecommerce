import { Request, Response } from "express";
import { z } from "zod";
import { User } from "../models/user-model";
import { verifyPassword } from "../utils/hashing";
import jwt from "jsonwebtoken";
import {
  createCustomer,
  RegisterBody,
  validateRegistrationRequest,
} from "../core/auth";

const loginSchema = z
  .object({
    username: z.string(),
    password: z.string().min(8),
  })
  .strict();

type LoginBody = z.infer<typeof loginSchema>;

class AuthController {
  async register(req: Request, res: Response) {
    try {
      validateRegistrationRequest(req);
      await createCustomer(req.body as RegisterBody);
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
