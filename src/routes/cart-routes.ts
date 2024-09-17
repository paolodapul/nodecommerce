import express from "express";
import * as cartController from "../controllers/cart-controller";
import { jwtVerification } from "../middleware";
import { asyncHandler } from "../utils/async-handler";

const router = express.Router();

router.get(
  "/",
  asyncHandler(jwtVerification("view_cart")),
  asyncHandler(cartController.getCart)
);

router.post(
  "/",
  asyncHandler(jwtVerification("add_to_cart")),
  asyncHandler(cartController.addToCart)
);

router.put(
  "/:productId",
  asyncHandler(jwtVerification("update_cart")),
  asyncHandler(cartController.updateCartItem)
);

router.delete(
  "/:productId",
  asyncHandler(jwtVerification("remove_from_cart")),
  asyncHandler(cartController.removeFromCart)
);

export default router;
