import { Cart } from "../models/cart-model";

async function truncateCarts() {
  await Cart.deleteMany({});
}

export { truncateCarts };
