import express from "express";
import userRoutes from "./userRoutes";
import productRoutes from "./productRoutes";

const router = express.Router();
router.use("/users", userRoutes);
router.use("/products", productRoutes);

export default router;
