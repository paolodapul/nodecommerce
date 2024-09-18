import { Order } from "../models/order-model";

async function truncateOrders() {
  await Order.deleteMany({});
}

export { truncateOrders };
