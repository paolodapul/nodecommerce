import express from "express";
import productRoutes from "./productRoutes";
import cartRoutes from "./cartRoutes";
import orderRoutes from "./orderRoutes";

const router = express.Router();
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);

export default router;
