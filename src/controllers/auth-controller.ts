import { Request, Response } from "express";
import {
  createCustomer,
  generateToken,
  LoginBody,
  RegisterBody,
  validateLoginRequest,
  validateRegistrationRequest,
  verifyUser,
} from "../core/auth";

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
      validateLoginRequest(req);
      const userData = req.body as LoginBody;
      const validUser = await verifyUser(userData);
      const token = generateToken(validUser);
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
