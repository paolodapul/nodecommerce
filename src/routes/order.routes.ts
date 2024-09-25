import express from 'express';
import {
  createOrderController,
  getAllOrdersController,
  getOrderByIdController,
  updateOrderStatusController,
} from '../controllers/order.controller';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.post('/', protect, authorize('buyer'), createOrderController);
router.get(
  '/',
  protect,
  authorize('admin', 'buyer', 'seller'),
  getAllOrdersController,
);
router.get(
  '/:id',
  protect,
  authorize('admin', 'buyer', 'seller'),
  getOrderByIdController,
);
router.patch(
  '/:id/status',
  protect,
  authorize('admin', 'seller'),
  updateOrderStatusController,
);

export default router;
