import express from "express";
import * as paymentController from "../controllers/payment-controller";
import { asyncHandler } from "../utils/async-handler";
import { jwtVerification } from "../middleware";

const router = express.Router();

router.post(
  "/checkout",
  asyncHandler(jwtVerification("add_to_cart")),
  asyncHandler(paymentController.checkout)
);
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.webhook
);
router.get("/success", paymentController.handlePaymentSuccess);
router.get("/cancel", paymentController.handlePaymentCancel);

export default router;
