import { Request, Response, NextFunction } from "express";
import * as StripeService from "../services/stripe";
import { CheckoutRequest, WebhookBody } from "../types/payment-types";
import {
  InternalServerErrorException,
  UnauthorizedException,
} from "../types/error-types";
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
    const session = await StripeService.createPaymentSession(
      lineItems,
      order._id as string
    );
    res.status(201).json(session);
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
    const session = StripeService.webhook(
      req.body as WebhookBody,
      req.header("stripe-signature")!
    );

    if (!session) {
      throw new InternalServerErrorException(
        "There was an error with your payment."
      );
    }

    await OrderCore.updateOrderStatus(
      session?.metadata?.orderId as string,
      "completed"
    );
    res.status(200).send("Order has been completed.");
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
