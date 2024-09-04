/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/unbound-method */
import express from "express";
import cartController from "../../controllers/cartController";

const router = express.Router();

/**
 * Get cart
 */

router.get("/:userId", cartController.getCart);

/**
 * Add to cart
 */

router.post("/:userId/items", cartController.addToCart);

/**
 * Update cart item
 */

router.put("/:userId/items/:productId", cartController.updateCartItem);

/**
 * Remove from cart
 */

router.delete("/:userId/items/:productId", cartController.removeFromCart);

export default router;
