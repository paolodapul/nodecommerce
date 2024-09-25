import express from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authorize, protect } from '../middleware/auth';

const router = express.Router();

router
  .route('/checkout')
  .post(protect, authorize('buyer'), paymentController.checkout);

router.route('/success').get(paymentController.handlePaymentSuccess);

export default router;
