import { Request } from "express";
import { AuthRequest } from "./auth-types";

export type WebhookBody = string | Buffer;
export type LineItem = {
  price: string;
  quantity: number;
};

export interface CheckoutRequest extends Request, AuthRequest {
  body: {
    orderId: string;
  };
}
