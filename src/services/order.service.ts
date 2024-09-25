import { Workflow } from '../core/workflow';
import { ProductModel } from '../models/product.model';
import { OrderModel, IOrder, OrderStatus } from '../models/order.model';
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
  shippingFee?: number;
  finalPrice?: number;
  order?: IOrder;
}

export const createOrder = async (input: CreateOrderInput): Promise<IOrder> => {
  const result = await Workflow.createWorkflow<WorkflowData>(3, (workflow) => {
    workflow
      .create(
        async (orderInput: WorkflowData, session: mongoose.ClientSession) => {
          // Validate products and check stock
          const productIds = orderInput.items.map((item) => item.productId);
          const products = await ProductModel.find({
            _id: { $in: productIds },
          }).session(session);

          if (products.length !== productIds.length) {
            throw new ApiError(400, 'One or more products not found');
          }

          const insufficientStock = products.some((product, index) => {
            return product.stock < orderInput.items[index].quantity;
          });

          if (insufficientStock) {
            throw new ApiError(
              400,
              'Insufficient stock for one or more products',
            );
          }

          return { ...orderInput, products };
        },
      )
      .create(async (data: WorkflowData, session: mongoose.ClientSession) => {
        // Calculate total price
        const totalPrice = data.items.reduce((sum, item, index) => {
          const product = data.products![index];
          return sum + product.price * item.quantity;
        }, 0);

        // Calculate shipping fee (you may want to implement a more complex logic)
        const shippingFee = 10; // Example flat rate

        // Calculate final price
        const finalPrice = totalPrice + shippingFee;

        return { ...data, totalPrice, shippingFee, finalPrice };
      })
      .create(async (data: WorkflowData, session: mongoose.ClientSession) => {
        // Create order
        const orderData = {
          user: data.userId,
          items: data.items.map((item, index) => ({
            product: item.productId,
            quantity: item.quantity,
            price: data.products![index].price,
          })),
          totalPrice: data.totalPrice!,
          shippingFee: data.shippingFee!,
          finalPrice: data.finalPrice!,
          status: 'pending',
          shippingAddress: data.shippingAddress,
          paymentInfo: {
            status: 'pending',
          },
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
            { session, new: true },
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

/**
 * Retrieves all orders based on user role and ID, including completed orders
 * @param {string} [userId] - The ID of the user (for buyers)
 * @param {string} [sellerId] - The ID of the seller (for sellers)
 * @returns {Promise<IOrder[]>} Array of orders
 */
export const getAllOrders = async (
  userId?: string,
  sellerId?: string,
): Promise<IOrder[]> => {
  let query: any = {};

  if (userId) {
    query.user = userId;
  } else if (sellerId) {
    const sellerProductIds = await ProductModel.find({
      seller: sellerId,
    }).distinct('_id');
    query = { 'items.product': { $in: sellerProductIds } };
  }

  const orders = await OrderModel.find(query)
    .populate('user', 'name email')
    .populate({
      path: 'items.product',
      select: 'name price seller',
      populate: {
        path: 'seller',
        select: 'name email',
      },
    })
    .select('-__v')
    .sort('-createdAt');

  return orders;
};

/**
 * Retrieves a single order by ID
 * @param {string} orderId - The ID of the order to retrieve
 * @param {string} userId - The ID of the user making the request
 * @param {string} userRole - The role of the user making the request
 * @returns {Promise<IOrder | null>} The order if found and authorized, null otherwise
 */
export const getOrderById = async (
  orderId: string,
  userId: string,
  userRole: string,
): Promise<IOrder | null> => {
  let order = await OrderModel.findById(orderId)
    .populate('user', 'name email')
    .populate({
      path: 'items.product',
      select: 'name price seller',
      populate: {
        path: 'seller',
        select: 'name email',
      },
    });

  if (!order) {
    return null;
  }

  // Check if the user has permission to view this order
  if (userRole === 'buyer' && order.user._id.toString() !== userId) {
    throw new ApiError(403, 'Not authorized to view this order');
  }

  if (userRole === 'seller') {
    const sellerProductIds = await ProductModel.find({
      seller: userId,
    }).distinct('_id');
    const hasSellerProduct = order.items.some((item) =>
      sellerProductIds.includes(item.product._id),
    );

    if (!hasSellerProduct) {
      throw new ApiError(403, 'Not authorized to view this order');
    }
  }

  return order;
};

/**
 * Updates the status of an order
 * @param {string} orderId - The ID of the order to update
 * @param {OrderStatus} newStatus - The new status to set
 * @param {string} userId - The ID of the user making the request
 * @param {string} userRole - The role of the user making the request
 * @returns {Promise<IOrder | null>} The updated order if found and authorized, null otherwise
 */
export const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
  userId: string,
  userRole: string,
): Promise<IOrder | null> => {
  const order = await OrderModel.findById(orderId).populate('items.product');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Define valid statuses based on user role
  const validStatusesForSellers: OrderStatus[] = ['processing', 'shipped'];
  const validStatusesForAdmins: OrderStatus[] = [
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'completed',
  ];

  let validStatuses: OrderStatus[];
  if (userRole === 'admin') {
    validStatuses = validStatusesForAdmins;
  } else if (userRole === 'seller') {
    validStatuses = validStatusesForSellers;

    // Check if the seller owns any product in the order
    const hasSellerProduct = order.items.some((item) => {
      const product = item.product as any; // Type assertion due to population
      return product.seller.toString() === userId;
    });

    if (!hasSellerProduct) {
      throw new ApiError(403, 'Not authorized to update this order');
    }
  } else {
    throw new ApiError(403, 'Not authorized to update order status');
  }

  // Validate the new status
  if (!validStatuses.includes(newStatus)) {
    throw new ApiError(
      400,
      `Invalid order status. Valid statuses for ${userRole} are: ${validStatuses.join(', ')}`,
    );
  }

  // Prevent certain status changes
  if (order.status === 'cancelled' || order.status === 'completed') {
    throw new ApiError(
      400,
      'Cannot change status of cancelled or completed orders',
    );
  }

  // Set completedAt date if the new status is 'completed'
  if (newStatus === 'completed') {
    order.completedAt = new Date();
  }

  order.status = newStatus;
  await order.save();

  return order;
};
