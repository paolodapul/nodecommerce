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

  if (!token) {
    return res
      .status(403)
      .json({ message: "A token is required for authentication" });
  }

  try {
    if (process.env.JWT_SECRET) {
      const decoded = jwt.verify(
        token.replace("Bearer ", ""),
        process.env.JWT_SECRET
      );
      req.user = decoded;
    }
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid Token" });
  }

  return next();
};

export { jwtVerification };
