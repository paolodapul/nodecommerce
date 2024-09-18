import express from "express";
import * as paymentController from "../controllers/payment-controller";
import { asyncHandler } from "../utils/async-handler";

const router = express.Router();

router.post("/checkout", asyncHandler(paymentController.checkout));
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.webhook
);
router.get("/success", paymentController.handlePaymentSuccess);
router.get("/cancel", paymentController.handlePaymentCancel);

export default router;
