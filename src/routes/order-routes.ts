/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import orderController from "../controllers/order-controller";
import { jwtVerification } from "../middleware";

const router = express.Router();

/**
 * Create order
 */

router.post("/", jwtVerification("create_order"), orderController.createOrder);

/**
 * Get order by ID
 */

router.get(
  "/:orderId",
  jwtVerification("view_orders"),
  orderController.getOrder
);

/**
 * Update order
 */

router.patch(
  "/:orderId",
  jwtVerification("update_orders"),
  orderController.updateOrder
);

/**
 * Cancel order
 */

router.post(
  "/:orderId/cancel",
  jwtVerification("cancel_orders"),
  orderController.cancelOrder
);

/**
 *  (Admin) Get user orders
 */

router.get("/user/:userId", orderController.getUserOrders);

/**
 * (Admin) Update order status
 */
router.patch("/:orderId/status", orderController.updateOrderStatus);

export default router;
