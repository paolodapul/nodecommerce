import { NextFunction, Request, Response } from "express";
import { createCustomer, generateToken, verifyUser } from "../core/auth";
import { validate } from "../utils/validator";
import {
  LoginInput,
  loginSchema,
  RegisterInput,
  registerSchema,
} from "../schemas/auth-schema";
import { BadRequestException } from "../types/error-types";

class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validationResult = validate(registerSchema, req.body);
      if (!validationResult.success) {
        throw new BadRequestException(validationResult.errors);
      }
      await createCustomer(req.body as RegisterInput);
      res.status(200).json({ description: "Registration successful!" });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validationResult = validate(loginSchema, req.body);
      if (!validationResult.success) {
        throw new BadRequestException(validationResult.errors);
      }
      const userData = req.body as LoginInput;
      const validUser = await verifyUser(userData);
      const token = generateToken(validUser);
      res.status(200).json({ description: "Log in successful.", token });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
