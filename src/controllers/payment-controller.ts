import { Request, Response, NextFunction } from "express";
import * as StripeService from "../services/stripe";
import { WebhookBody } from "../types/payment-types";

export const checkout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await StripeService.createPaymentSession();
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

export const webhook = (req: Request, res: Response, next: NextFunction) => {
  try {
    StripeService.webhook(
      req.body as WebhookBody,
      req.header("stripe-signature")!
    );
    res.status(200).end();
  } catch (error) {
    next(error);
  }
};

export const handlePaymentSuccess = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).send("Payment successful!");
  } catch (error) {
    next(error);
  }
};

export const handlePaymentCancel = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(400).send("Payment cancelled!");
  } catch (error) {
    next(error);
  }
};
