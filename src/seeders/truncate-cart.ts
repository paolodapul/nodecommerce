import { logger } from '../config/logger';
import { CartModel } from '../models/cart.model';

async function truncateCarts() {
  await CartModel.deleteMany({});
  logger.info('Cart data has been truncated.');
}

export { truncateCarts };
