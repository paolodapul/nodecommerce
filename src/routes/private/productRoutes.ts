/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/unbound-method */
import express from "express";
import productController from "../../controllers/product-controller";
import { checkPermission } from "../../middleware/checkPermission";

const router = express.Router();

router.post(
  "/",
  checkPermission("create_products"),
  productController.createProduct
);
router.put(
  "/:id",
  checkPermission("update_products"),
  productController.updateProduct
);
router.delete(
  "/:id",
  checkPermission("delete_products"),
  productController.deleteProduct
);

export default router;
