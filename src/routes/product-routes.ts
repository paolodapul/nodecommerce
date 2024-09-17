import express from "express";
import * as productController from "../controllers/product-controller";
import { jwtVerification } from "../middleware";
import { asyncHandler } from "../utils/async-handler";

const router = express.Router();

// Public
router.get("/", asyncHandler(productController.getAllProducts));
router.get("/:id", asyncHandler(productController.getProductById));

router.post(
  "/",
  asyncHandler(jwtVerification("create_products")),
  asyncHandler(productController.createProduct)
);
router.put(
  "/:id",
  asyncHandler(jwtVerification("update_products")),
  asyncHandler(productController.updateProduct)
);
router.delete(
  "/:id",
  asyncHandler(jwtVerification("delete_products")),
  asyncHandler(productController.deleteProduct)
);

router.post(
  "/:id/reviews",
  asyncHandler(jwtVerification("create_review")),
  asyncHandler(productController.addReview)
);

export default router;
