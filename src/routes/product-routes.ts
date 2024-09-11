/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/unbound-method */
import express from "express";
import productController from "../controllers/product-controller";
import { jwtVerification } from "../middleware";

const router = express.Router();

// Public
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

router.post(
  "/",
  jwtVerification("create_products"),
  productController.createProduct
);
router.put(
  "/:id",
  jwtVerification("update_products"),
  productController.updateProduct
);
router.delete(
  "/:id",
  jwtVerification("delete_products"),
  productController.deleteProduct
);

router.post(
  "/:id/reviews",
  jwtVerification("create_review"),
  productController.addReview
);

export default router;
