import { Response, NextFunction } from 'express';
import { createOrder, getAllOrders } from '../services/order.service';
import { AuthRequest } from '../middleware/auth';

export const createOrderController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { items, shippingAddress } = req.body;
    const userId = req.user!.id;

    const order = await createOrder({ userId, items, shippingAddress });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: order._id,
        totalPrice: order.totalPrice,
        shippingFee: order.shippingFee,
        finalPrice: order.finalPrice,
        status: order.status
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrdersController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let orders;
    switch (req.user!.role) {
      case 'admin':
        // Admins can see all orders
        orders = await getAllOrders();
        break;
      case 'buyer':
        // Buyers can only see their own orders
        orders = await getAllOrders(req.user!.id);
        break;
      case 'seller':
        // Sellers see orders containing their products
        orders = await getAllOrders(undefined, req.user!.id);
        break;
      default:
        return res.status(403).json({ success: false, message: 'Unauthorized role' });
    }

    const formattedOrders = orders.map(order => ({
      id: order._id,
      user: order.user,
      items: order.items,
      totalPrice: order.totalPrice,
      shippingFee: order.shippingFee,
      finalPrice: order.finalPrice,
      status: order.status,
      shippingAddress: order.shippingAddress,
      paymentInfo: order.paymentInfo,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    res.status(200).json({
      success: true,
      count: formattedOrders.length,
      data: formattedOrders
    });
  } catch (error) {
    next(error);
  }
};
