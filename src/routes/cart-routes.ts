import express from "express";
import * as cartController from "../controllers/cart-controller";
import { jwtVerification } from "../middleware";
import { asyncHandler } from "../utils/async-handler";

const router = express.Router();

router.get(
  "/:userId",
  asyncHandler(jwtVerification("view_cart")),
  asyncHandler(cartController.getCart)
);

router.post(
  "/:userId/items",
  asyncHandler(jwtVerification("add_to_cart")),
  asyncHandler(cartController.addToCart)
);

router.put(
  "/:userId/items/:productId",
  asyncHandler(jwtVerification("update_cart")),
  asyncHandler(cartController.updateCartItem)
);

router.delete(
  "/:userId/items/:productId",
  asyncHandler(jwtVerification("remove_from_cart")),
  asyncHandler(cartController.removeFromCart)
);

export default router;
