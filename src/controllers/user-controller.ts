import { NextFunction, Request, RequestHandler, Response } from "express";
import * as userService from "../services/user-service";

type User = {
  username: string;
  email: string;
  password: string;
};

const register = (async (
  req: Request<object, object, User>,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  try {
    const userData = req.body;
    const newUser = await userService.register(userData);
    res
      .status(201)
      .json({ description: "New user has been created.", id: newUser._id });
  } catch (error) {
    res.status(500).json({
      error: "Registration failed",
      message: (error as Error).message,
    });
  }
}) as RequestHandler;

const login = (async (
  req: Request<object, object, User>,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  try {
    const userData = req.body;
    const user = await userService.login(userData);
    res.status(200).json({ description: "Found user.", user });
  } catch (error) {
    res.status(500).json({
      error: "Login failed",
      message: (error as Error).message,
    });
  }
}) as RequestHandler;

export { register, login };
