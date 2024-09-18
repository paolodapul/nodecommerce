import express from 'express';
import { optionalProtect } from '../middleware/auth';
import {
  getCartController,
  addToCartController,
  removeFromCartController,
  updateCartItemQuantityController,
  clearCartController,
  getCartTotalController
} from '../controllers/cart.controller';

const router = express.Router();

router.use(optionalProtect);  // This middleware should allow both authenticated and unauthenticated requests

router.get('/', getCartController);
router.post('/add', addToCartController);
router.delete('/remove/:productId', removeFromCartController);
router.put('/update/:productId', updateCartItemQuantityController);
router.delete('/clear', clearCartController);
router.get('/total', getCartTotalController);

export default router;
