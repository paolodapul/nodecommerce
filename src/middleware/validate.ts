import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import ApiError from '../utils/apiError';

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      return next(
        new ApiError(400, 'Validation error', true, JSON.stringify(error)),
      );
    }
  };
