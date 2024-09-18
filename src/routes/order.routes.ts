import express from 'express';
import { createOrderController, getAllOrdersController } from '../controllers/order.controller';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.post('/', protect, authorize('buyer'), createOrderController);
router.get('/', protect, authorize('admin', 'buyer', 'seller'), getAllOrdersController);

export default router;
