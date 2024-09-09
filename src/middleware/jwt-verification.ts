import { NextFunction, Request, Response } from "express";
import jwt, {
  JsonWebTokenError,
  JwtPayload,
  TokenExpiredError,
} from "jsonwebtoken";
import { Role } from "../models/role-model";
import { User } from "../models/user-model";

interface AuthPayload extends JwtPayload {
  id?: string;
  role?: string;
}

interface CustomRequest extends Request {
  user?: AuthPayload;
}

const jwtVerification = async (
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
      // Check if token is valid
      const decodedJwt = jwt.verify(
        token,
        process.env.JWT_SECRET
      ) as AuthPayload;

      // Initialize req.user
      req.user = {
        id: "",
        role: "",
      };

      // Compare user and role against the database to check if valid
      const user = await User.findById(decodedJwt.id);
      if (!user) {
        throw new Error("User not found.");
      }

      const role = await Role.findById(decodedJwt.role);
      if (!role) {
        throw new Error("Role is invalid.");
      }

      // If token is valid, include user ID and role in req.user
      req.user.id = decodedJwt.id;
      req.user.role = decodedJwt.role;
    }
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ message: "Token has expired." });
    } else if (error instanceof JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token." });
    } else {
      return res.status(500).json({
        message: "Internal server error during authentication.",
        details: (error as Error).message,
      });
    }
  }

  return next();
};

export { jwtVerification };
