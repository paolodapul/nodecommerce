import express from "express";
import productRoutes from "./product-routes";
import cartRoutes from "./cart-routes";
import orderRoutes from "./order-routes";
import authRoutes from "./auth-routes";
import paymentRoutes from "./payment-routes";
import indexRoutes from "./index-routes";
import webhookRoutes from "./webhook-routes";

const router = express.Router();

router.use("/", indexRoutes);
router.use(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  webhookRoutes
);

router.use(express.json());
router.use("/api/products", productRoutes);
router.use("/api/cart", cartRoutes);
router.use("/api/orders", orderRoutes);
router.use("/api/auth", authRoutes);
router.use("/api/payments", paymentRoutes);

export default router;
