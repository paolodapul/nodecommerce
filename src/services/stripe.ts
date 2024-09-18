import Stripe from "stripe";
import { InternalServerErrorException } from "../types/error-types";
import dotenv from "dotenv";
import { LineItem } from "../types/payment-types";

const ENV = process.env.NODE_ENV ?? "development";
dotenv.config({ path: `.env.${ENV}` });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createPaymentSession = async (lineItems: LineItem[]) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `http://${process.env.HOST}:${process.env.PORT}/api/payments/success`,
      cancel_url: `http://${process.env.HOST}:${process.env.PORT}/api/payments/cancel`,
    });
    return session;
  } catch (error) {
    throw new InternalServerErrorException((error as Error).message);
  }
};

export const webhook = (rawBody: Buffer | string, signature: string) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      return session;
    }
  } catch (error) {
    throw new InternalServerErrorException((error as Error).message);
  }
};
