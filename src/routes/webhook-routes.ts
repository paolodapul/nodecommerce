import express from "express";
import * as paymentController from "../controllers/payment-controller";

const router = express.Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.webhook
);

export default router;
