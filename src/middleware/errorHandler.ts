import { NextFunction, Request, Response } from "express";

function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  /**
   * TODO: Implement a proper logging service
   */
  console.error(err.stack);

  res.status(500).json({
    message: "Internal Server Error",
    error: err.message,
  });
}

export { errorHandler };
