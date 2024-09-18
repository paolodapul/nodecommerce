import { Order } from "../models/order-model";
import logger from "../utils/logger";

async function truncateOrders() {
  await Order.deleteMany({});
  logger.info("Order data has been truncated.");
}

export { truncateOrders };
