import { Workflow } from '../core/workflow';
import { IOrder, OrderModel } from '../models/order.model';
import { PaymentModel } from '../models/payment.model';
import mongoose from 'mongoose';
import ApiError from '../utils/apiError';
import Stripe from 'stripe';
import { logger } from '../config/logger';
import { config } from '../config/config';

const stripe = new Stripe(config.stripeSecretKey);

interface WebhookInput {
  rawBody: string;
  signature: string;
}

interface WorkflowData extends WebhookInput {
  event?: Stripe.Event;
  paymentIntent?: Stripe.PaymentIntent;
  payment?: any;
  order?: any;
}

export const handleStripeWebhook = async (
  input: WebhookInput,
): Promise<IOrder> => {
  const result = await Workflow.createWorkflow<WorkflowData>(3, (workflow) => {
    workflow
      .create(async (data: WorkflowData, session: mongoose.ClientSession) => {
        const event = stripe.webhooks.constructEvent(
          data.rawBody,
          data.signature,
          config.stripeWebhookSecret,
        );

        return { event };
      })
      .create(async (data: WorkflowData, session: mongoose.ClientSession) => {
        switch (data.event?.type) {
          case 'payment_intent.succeeded':
            data.paymentIntent = data.event.data.object as Stripe.PaymentIntent;

            data.payment = await PaymentModel.findOne({
              transactionId: data.paymentIntent.id,
            }).session(session);

            if (!data.payment) {
              throw new ApiError(404, 'Payment not found');
            }

            data.payment.status = 'succeeded';
            await data.payment.save({ session });

            break;
          case 'payment_intent.payment_failed':
            data.paymentIntent = data.event.data.object as Stripe.PaymentIntent;

            data.payment = await PaymentModel.findOne({
              transactionId: data.paymentIntent.id,
            }).session(session);

            if (!data.payment) {
              throw new ApiError(404, 'Payment not found');
            }

            data.payment.status = 'failed';
            await data.payment.save({ session });

            break;
        }

        return data;
      })
      .create(async (data: WorkflowData, session: mongoose.ClientSession) => {
        if (data.payment) {
          data.order = await OrderModel.findById(data.payment.order).session(
            session,
          );

          if (!data.order) {
            throw new ApiError(404, 'Order not found');
          }

          data.order.status =
            data.payment.status === 'succeeded'
              ? 'processing'
              : 'payment_failed';

          data.order.paymentInfo.status = data.payment.status;

          await data.order.save({ session });
        }
        return data;
      })
      .finally(async (data: WorkflowData, session: mongoose.ClientSession) => {
        if (data.order && data.payment) {
          logger.info(
            `Order ${data.order._id} updated. Payment status: ${data.payment.status}`,
          );
        }
      });
  }).run(input);

  if (!result.order) {
    throw new ApiError(500, 'Payment failed');
  }

  return result.order;
};
