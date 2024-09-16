/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import {
  HttpException,
  InternalServerErrorException,
} from "../types/error-types";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err);

  if (err instanceof HttpException) {
    res.status(err.statusCode).json({
      error: {
        name: err.name,
        message: err.message,
        statusCode: err.statusCode,
      },
    });
  } else {
    const internalError = new InternalServerErrorException(
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message
    );
    res.status(internalError.statusCode).json({
      error: {
        name: internalError.name,
        message: internalError.message,
        statusCode: internalError.statusCode,
      },
    });
  }
};

export default errorHandler;
