import express from 'express';
import * as paymentController from '../controllers/payment.controller';

const router = express.Router();

router.route('/').post(paymentController.webhook);

export default router;
