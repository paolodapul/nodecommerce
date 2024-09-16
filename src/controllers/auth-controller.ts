import { Request, Response } from "express";
import {
  createCustomer,
  generateToken,
  validateLoginRequest,
  verifyUser,
} from "../core/auth";
import { validate, ValidationError } from "../utils/validator";
import {
  LoginInput,
  RegisterInput,
  registerSchema,
} from "../schemas/auth-schema";

class AuthController {
  async register(req: Request, res: Response) {
    try {
      validate(registerSchema, req.body);
      await createCustomer(req.body as RegisterInput);
      res.status(200).json({ description: "Registration successful!" });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(500).json({
          error: "Registration failed",
          message: error.errorMessages,
        });
      } else {
        res.status(500).json({
          error: "Registration failed",
          message: (error as Error).message,
        });
      }
    }
  }

  async login(req: Request, res: Response) {
    try {
      validateLoginRequest(req);
      const userData = req.body as LoginInput;
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
