import Stripe from 'stripe';
import dotenv from 'dotenv';
import { logger } from '../config/logger';
import { ProductModel, StripeProduct } from '../models/product.model';
import { UserModel } from '../models/user.model';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function archiveStripeProductsAndDeactivatePrices() {
  const products = await stripe.products.list({ limit: 100, active: true });
  for (const product of products.data) {
    await stripe.products.update(product.id, { active: false });
  }

  const prices = await stripe.prices.list({ limit: 100, active: true });
  for (const price of prices.data) {
    await stripe.prices.update(price.id, { active: false });
  }

  logger.info('All active Stripe products archived and prices deactivated');
}

async function createStripeProductAndPrice(product: StripeProduct) {
  const stripeProduct = await stripe.products.create({
    name: product.name,
    description: product.description,
  });

  const stripePrice = await stripe.prices.create({
    product: stripeProduct.id,
    unit_amount: product.price * 100, // Stripe uses cents
    currency: 'usd',
  });

  return { productId: stripeProduct.id, priceId: stripePrice.id };
}

async function initializeProducts() {
  try {
    await ProductModel.deleteMany({});
    await archiveStripeProductsAndDeactivatePrices();

    const sellers = await UserModel.find().limit(2);
    if (sellers.length < 2) {
      throw new Error('Not enough users found. Please run user seeder first.');
    }

    const products = [
      {
        name: 'iPhone 13',
        description: "Apple's flagship smartphone",
        price: 799,
        category: 'electronics',
        seller: sellers[0]._id,
        stock: 100,
        images: ['iphone13.jpg'],
      },
      {
        name: 'The Great Gatsby',
        description: 'Classic novel by F. Scott Fitzgerald',
        price: 15,
        category: 'books',
        seller: sellers[1]._id,
        stock: 200,
        images: ['great_gatsby.jpg'],
      },
      {
        name: 'Smart LED Bulb',
        description: 'WiFi-enabled color changing bulb',
        price: 30,
        category: 'home',
        seller: sellers[0]._id,
        stock: 150,
        images: ['smart_bulb.jpg'],
      },
      {
        name: 'Cotton T-Shirt',
        description: 'Comfortable plain t-shirt',
        price: 40,
        category: 'clothing',
        seller: sellers[1]._id,
        stock: 300,
        images: ['tshirt.jpg'],
      },
      {
        name: 'LEGO Classic Set',
        description: 'Creative building blocks for kids',
        price: 50,
        category: 'toys',
        seller: sellers[0]._id,
        stock: 75,
        images: ['lego_set.jpg'],
      },
    ];

    for (const product of products) {
      // Create Stripe product and price
      const { productId, priceId } = await createStripeProductAndPrice(
        product as StripeProduct,
      );

      await ProductModel.create({
        ...product,
        stripeProductId: productId,
        stripePriceId: priceId,
      });
    }

    logger.info('Products and Stripe data seeded successfully');
  } catch (error) {
    logger.error('Error seeding products and Stripe data:', error);
  }
}

export { initializeProducts };
