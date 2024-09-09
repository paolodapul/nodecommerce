/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/unbound-method */
import express from "express";
import cartController from "../controllers/cart-controller";
import { jwtVerification } from "../middleware";

const router = express.Router();

/**
 * Get cart
 */

router.get("/:userId", jwtVerification("view_cart"), cartController.getCart);

/**
 * Add to cart
 */

router.post(
  "/:userId/items",
  jwtVerification("add_to_cart"),
  cartController.addToCart
);

/**
 * Update cart item
 */

router.put(
  "/:userId/items/:productId",
  jwtVerification("update_cart"),
  cartController.updateCartItem
);

/**
 * Remove from cart
 */

router.delete(
  "/:userId/items/:productId",
  jwtVerification("remove_from_cart"),
  cartController.removeFromCart
);

export default router;
