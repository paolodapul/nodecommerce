import { Cart } from "../models/cart-model";
import logger from "../utils/logger";

async function truncateCarts() {
  await Cart.deleteMany({});
  logger.info("Cart data has been truncated.");
}

export { truncateCarts };
