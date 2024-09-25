import { Request, Response, NextFunction } from 'express';
import { ProductModel, IProduct } from '../models/product.model';
import { AuthRequest } from '../middleware/auth';
import * as PaymentService from '../services/payment.service';
import * as WebhookService from '../services/webhook.service';
import ApiError from '../utils/apiError';
import { UserModel } from '../models/user.model';

export const checkout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.body;
    const userId = req.user!.id;

    const user = await UserModel.findById(userId).select(
      'stripePaymentMethodId',
    );

    const payment = await PaymentService.processPayment({
      orderId: orderId,
      paymentMethodId: user?.stripePaymentMethodId!,
      userId: userId,
    });

    res.status(201).json({
      success: true,
      message: 'Payment intent created.',
      data: {
        orderId: payment.order._id,
        amount: payment.amount,
        status: payment.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const webhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const stripeSession = await WebhookService.handleStripeWebhook({
      rawBody: req.body,
      signature: req.header('stripe-signature')!,
    });

    if (!stripeSession) {
      throw new ApiError(500, 'There was an error with your payment.');
    }
  } catch (error) {
    next(error);
  }
};

export const createPaymentMethod = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;

    const payment = await PaymentService.createPaymentMethod(userId);

    res.status(201).json({
      success: true,
      message: 'Payment method created for user.',
      data: {
        paymentMethodId: payment.paymentMethodId,
      },
    });
  } catch (error) {
    next(error);
  }
};
