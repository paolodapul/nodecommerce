import express from 'express';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
} from '../controllers/product.controller';
import { protect, authorize, checkProductOwnership } from '../middleware/auth';
import upload from '../utils/fileUpload';

const router = express.Router();

router
  .route('/')
  .get(getProducts)
  .post(protect, authorize('seller'), upload.array('images', 5), createProduct);

router.route('/seller').get(protect, authorize('seller'), getSellerProducts);

router
  .route('/:id')
  .get(getProduct)
  .put(
    protect,
    authorize('seller'),
    checkProductOwnership,
    upload.array('images', 5),
    updateProduct,
  )
  .delete(protect, authorize('seller'), checkProductOwnership, deleteProduct);

export default router;
