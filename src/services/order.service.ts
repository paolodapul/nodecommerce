import { Workflow } from '../core/workflow';
import { ProductModel } from '../models/product.model';
import { OrderModel, IOrder } from '../models/order.model';
import mongoose from 'mongoose';
import ApiError from '../utils/apiError';

interface OrderItem {
  productId: string;
  quantity: number;
}

interface CreateOrderInput {
  userId: string;
  items: OrderItem[];
  shippingAddress: string;
}

interface WorkflowData extends CreateOrderInput {
  products?: any[];
  totalPrice?: number;
  order?: IOrder;
}

export const createOrder = async (input: CreateOrderInput): Promise<IOrder> => {
  const result = await Workflow.createWorkflow<WorkflowData>(3, (workflow) => {
    workflow
      .create(async (orderInput: WorkflowData, session: mongoose.ClientSession) => {
        // Validate products and check stock
        const productIds = orderInput.items.map(item => item.productId);
        const products = await ProductModel.find({ _id: { $in: productIds } }).session(session);

        if (products.length !== productIds.length) {
          throw new ApiError(400, 'One or more products not found');
        }

        const insufficientStock = products.some((product, index) => {
          return product.stock < orderInput.items[index].quantity;
        });

        if (insufficientStock) {
          throw new ApiError(400, 'Insufficient stock for one or more products');
        }

        return { ...orderInput, products };
      })
      .create(async (data: WorkflowData, session: mongoose.ClientSession) => {
        // Calculate total price
        const totalPrice = data.items.reduce((sum, item, index) => {
          const product = data.products![index];
          return sum + (product.price * item.quantity);
        }, 0);

        return { ...data, totalPrice };
      })
      .create(async (data: WorkflowData, session: mongoose.ClientSession) => {
        // Create order
        const orderData = {
          user: data.userId,
          items: data.items.map((item, index) => ({
            product: item.productId,
            quantity: item.quantity,
            price: data.products![index].price
          })),
          totalPrice: data.totalPrice!,
          status: 'pending',
          shippingAddress: data.shippingAddress,
          paymentInfo: {
            id: 'placeholder', // This should be updated with actual payment info
            status: 'pending',
            type: 'credit_card' // This should be dynamic based on user's choice
          }
        };

        const [order] = await OrderModel.create([orderData], { session });

        return { ...data, order };
      })
      .create(async (data: WorkflowData, session: mongoose.ClientSession) => {
        // Update product stock
        for (let i = 0; i < data.items.length; i++) {
          await ProductModel.findByIdAndUpdate(
            data.items[i].productId,
            { $inc: { stock: -data.items[i].quantity } },
            { session, new: true }
          );
        }

        return data;
      })
      .finally(async (data: WorkflowData, session: mongoose.ClientSession) => {
        // Send order confirmation (This could be an email service call)
        console.log(`Order confirmation sent for order ${data.order!._id}`);
      });
  }).run(input);

  if (!result.order) {
    throw new ApiError(500, 'Order creation failed');
  }

  return result.order;
};

export const getAllOrders = async (userId?: string, sellerId?: string): Promise<IOrder[]> => {
  let query: any = {};

  if (userId) {
    // For buyers: get only their orders
    query.user = userId;
  } else if (sellerId) {
    // For sellers: get orders containing their products
    const sellerProductIds = await ProductModel.find({ seller: sellerId }).distinct('_id');
    query = { 'items.product': { $in: sellerProductIds } };
  }
  // If neither userId nor sellerId is provided, no additional filter is applied (for admins)

  const orders = await OrderModel.find(query)
    .populate('user', 'name email')
    .populate({
      path: 'items.product',
      select: 'name price seller',
      populate: {
        path: 'seller',
        select: 'name email'
      }
    })
    .select('items totalPrice shippingFee finalPrice status shippingAddress paymentInfo createdAt updatedAt');

  return orders;
};
