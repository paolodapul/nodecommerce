import express from "express";
import productRoutes from "./product-routes";
import cartRoutes from "./cart-routes";
import orderRoutes from "./order-routes";
import authRoutes from "./auth-routes";
import paymentRoutes from "./payment-routes";

const router = express.Router();
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/auth", authRoutes);
router.use("/payments", paymentRoutes);

export default router;
