/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import orderController from "../controllers/order-controller";

const router = express.Router();

/**
 * Create order
 */

router.post("/", orderController.createOrder);

/**
 * Get order by ID
 */

router.get("/:orderId", orderController.getOrder);

/**
 * Get user orders
 */

router.get("/user/:userId", orderController.getUserOrders);

/**
 * Update order
 */

router.patch("/:orderId", orderController.updateOrder);

/**
 * Update order status
 */

router.patch("/:orderId/status", orderController.updateOrderStatus);

/**
 * Cancel order
 */

router.post("/:orderId/cancel", orderController.cancelOrder);

export default router;
