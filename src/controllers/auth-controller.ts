import { Request, Response } from "express";
import { z } from "zod";
import { User } from "../models/user-model";
import { verifyPassword } from "../utils/hashing";
import jwt from "jsonwebtoken";

const loginSchema = z
  .object({
    username: z.string(),
    password: z.string().min(8),
  })
  .strict();

type LoginBody = z.infer<typeof loginSchema>;

class AuthController {
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

      res.status(200).json({ description: "Found user.", token });
    } catch (error) {
      res.status(500).json({
        error: "Login failed",
        message: (error as Error).message,
      });
    }
  }
}

export default new AuthController();
