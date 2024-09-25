import { logger } from '../config/logger';
import { OrderModel } from '../models/order.model';

async function truncateOrders() {
  await OrderModel.deleteMany({});
  logger.info('Order data has been truncated.');
}

export { truncateOrders };
