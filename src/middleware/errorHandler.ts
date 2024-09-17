import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';
import { logger } from '../config/logger';
import ApiError from '../utils/apiError';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false, err.stack);
  }

  const response = {
    code: (error as ApiError).statusCode,
    message: error.message,
    ...(config.nodeEnv === 'development' && { stack: error.stack }),
  };

  if (config.nodeEnv === 'development') {
    logger.error(error);
  }

  res.status((error as ApiError).statusCode).json(response);
};
