import { Request, Response, NextFunction } from "express";
import { ProductModel, IProduct } from "../models/product.model";
import { AuthRequest } from "../middleware/auth";
import * as PaymentService from "../services/payment.service";
import * as WebhookService from "../services/webhook.service";
import ApiError from "../utils/apiError";

export const checkout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.body;
    const userId = req.user!.id;

    const payment = await PaymentService.processPayment({
      orderId: orderId,
      paymentMethodId: "", // hardcode
      userId: userId,
    });

    res.status(201).json({
      success: true,
      message: "Payment intent created.",
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
  next: NextFunction
) => {
  try {
    const stripeSession = await WebhookService.handleStripeWebhook({
      rawBody: req.body,
      signature: req.header("stripe-signature")!,
    });

    if (!stripeSession) {
      throw new ApiError(500, "There was an error with your payment.");
    }
  } catch (error) {
    next(error);
  }
};
