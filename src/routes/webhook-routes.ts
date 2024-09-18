import express from "express";
import * as paymentController from "../controllers/payment-controller";
import { asyncHandler } from "../utils/async-handler";

const router = express.Router();

router.post("/", asyncHandler(paymentController.webhook));

export default router;
