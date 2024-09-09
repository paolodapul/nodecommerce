import { NextFunction, Request, Response } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

interface CustomRequest extends Request {
  user?: jwt.JwtPayload | string;
}

const jwtVerification = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!authHeader || !token) {
    return res.status(401).json({ message: "Authentication failed." });
  }

  /**
   * Find a way to avoid needlessly calling the database
   *
   * Do all auth-related work in one middleware (jwt and check permission)
   */

  try {
    if (process.env.JWT_SECRET && token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Include user ID and role in req.user
    }
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ message: "Token has expired." });
    } else if (error instanceof JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token." });
    } else {
      return res
        .status(500)
        .json({ message: "Internal server error during authentication." });
    }
  }

  return next();
};

export { jwtVerification };
