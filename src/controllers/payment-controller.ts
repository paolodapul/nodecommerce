import { Request, Response, NextFunction } from "express";
import * as StripeService from "../services/stripe";
import { CheckoutRequest, WebhookBody } from "../types/payment-types";
import { UnauthorizedException } from "../types/error-types";
import * as OrderCore from "../core/order";
import { IOrder } from "../types/order-types";

export const checkout = async (
  req: CheckoutRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new UnauthorizedException("User not found.");
    }

    const order: IOrder = await OrderCore.getOrderById(req.body.orderId);
    const lineItems = StripeService.transformAsLineItems(order);
    const session = await StripeService.createPaymentSession(lineItems);
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
