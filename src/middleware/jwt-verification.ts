import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface CustomRequest extends Request {
  user?: jwt.JwtPayload | string;
}

const jwtVerification = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const headerValue = req.headers["authorization"];
  const token = typeof headerValue === "string" ? headerValue : undefined;

  /**
   * Find a way to avoid needlessly calling the database
   * Deny if:
   * 1. No auth header
   * 2. No bearer token
   *
   * Do all auth-related work in one middleware (jwt and check permission)
   */

  if (!token) {
    return res.status(403).json({ message: "Unauthorized access." });
  }

  try {
    if (process.env.JWT_SECRET) {
      const decoded = jwt.verify(
        token.replace("Bearer ", ""),
        process.env.JWT_SECRET
      );
      req.user = decoded; // Include user ID and role in req.user
    }
  } catch (err) {
    /**
     * JsonWebTokenError
     * TokenExpiredError
     */

    console.error(err);
    return res.status(401).json({ message: "Unauthorized access." });
  }

  return next();
};

export { jwtVerification };
