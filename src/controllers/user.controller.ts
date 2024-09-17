import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user.model';
import ApiError from '../utils/apiError';
import { AuthRequest } from '../middleware/auth';
import { RegisterInput, LoginInput } from '../schemas/user.schema';

export const register = async (req: Request<{}, {}, RegisterInput>, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;

    const user = await UserModel.create({
      name,
      email,
      password,
      role: role || 'buyer', // Use 'buyer' as default if role is not specified
    });

    const token = user.getSignedJwtToken();

    res.status(201).json({ success: true, token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request<{}, {}, LoginInput>, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ApiError(400, 'Please provide an email and password'));
    }

    const user = await UserModel.findOne({ email }).select('+password');

    if (!user) {
      return next(new ApiError(401, 'Invalid credentials'));
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return next(new ApiError(401, 'Invalid credentials'));
    }

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      role: user.role
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await UserModel.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
