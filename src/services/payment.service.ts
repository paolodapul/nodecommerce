import { Workflow } from '../core/workflow';
import { OrderModel, IOrder } from '../models/order.model';
import { PaymentModel, IPayment } from '../models/payment.model';
import mongoose from 'mongoose';
import ApiError from '../utils/apiError';
import Stripe from 'stripe';
import { logger } from '../config/logger';
import { UserModel } from '../models/user.model';
import { config } from '../config/config';

const stripe = new Stripe(config.stripeSecretKey);

interface ProcessPaymentInput {
  orderId: string;
  paymentMethodId: string;
  userId: string;
  stripeCustomerId: string;
}

interface WorkflowData extends ProcessPaymentInput {
  order?: IOrder;
  stripePaymentMethod?: Stripe.PaymentMethod;
  stripePaymentIntent?: Stripe.PaymentIntent;
  payment?: IPayment;
}

export const processPayment = async (
  input: ProcessPaymentInput,
): Promise<IPayment> => {
  const result = await Workflow.createWorkflow<WorkflowData>(3, (workflow) => {
    workflow
      .create(async (data: WorkflowData, session: mongoose.ClientSession) => {
        const order = await OrderModel.findById(data.orderId).session(session);

        if (!order) throw new ApiError(404, 'Order not found');

        if (order.user.toString() !== data.userId)
          throw new ApiError(403, 'Unauthorized');

        if (order.status !== 'pending')
          throw new ApiError(400, 'Order is not in pending status');

        return { ...data, order };
      })
      .create(async (data: WorkflowData, session: mongoose.ClientSession) => {
        const paymentMethod = await stripe.paymentMethods.retrieve(
          data.paymentMethodId,
        );

        if (!paymentMethod) throw new ApiError(400, 'Invalid payment method');

        return { ...data, stripePaymentMethod: paymentMethod };
      })
      .create(async (data: WorkflowData, session: mongoose.ClientSession) => {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(data.order!.finalPrice * 100), // Stripe uses cents
          currency: 'usd',
          payment_method: data.stripePaymentMethod!.id,
          confirm: true,
          customer: data.stripeCustomerId,
          return_url: `http://${config.host}:${config.port}/api/payments/success`,
        });

        return { ...data, stripePaymentIntent: paymentIntent };
      })
      .create(async (data: WorkflowData, session: mongoose.ClientSession) => {
        const paymentData = {
          order: data.orderId,
          user: data.userId,
          amount: data.order!.finalPrice,
          paymentMethod: data.stripePaymentMethod!.id,
          paymentType: data.stripePaymentMethod!.type,
          status: data.stripePaymentIntent!.status,
          transactionId: data.stripePaymentIntent!.id,
        };

        const [payment] = await PaymentModel.create([paymentData], { session });

        return { ...data, payment };
      })
      .finally(async (data: WorkflowData, session: mongoose.ClientSession) => {
        logger.info(`Payment confirmation sent for order ${data.orderId}`);
      });
  }).run(input);

  if (!result.payment) {
    throw new ApiError(500, 'Payment processing failed');
  }

  return result.payment;
};
