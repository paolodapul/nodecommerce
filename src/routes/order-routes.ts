import express from "express";
import * as orderController from "../controllers/order-controller";
import { jwtVerification } from "../middleware";
import { asyncHandler } from "../utils/async-handler";

const router = express.Router();

router.post(
  "/",
  asyncHandler(jwtVerification("create_order")),
  asyncHandler(orderController.createOrder)
);

router.get(
  "/:orderId",
  asyncHandler(jwtVerification("view_orders")),
  asyncHandler(orderController.getOrder)
);

router.patch(
  "/:orderId",
  asyncHandler(jwtVerification("update_orders")),
  asyncHandler(orderController.updateOrder)
);

router.post(
  "/:orderId/cancel",
  asyncHandler(jwtVerification("cancel_orders")),
  asyncHandler(orderController.cancelOrder)
);

router.get("/user/:userId", asyncHandler(orderController.getUserOrders));

router.patch(
  "/:orderId/status",
  asyncHandler(orderController.updateOrderStatus)
);

export default router;
