import express from "express";
import productRoutes from "./productRoutes";
import cartRoutes from "./cartRoutes";

const router = express.Router();
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);

export default router;
