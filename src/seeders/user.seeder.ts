import { UserModel, IUser } from '../models/user.model';
import { config } from '../config/config';
import Stripe from 'stripe';
import { logger } from '../config/logger';

const stripe = new Stripe(config.stripeSecretKey);

async function initializeUsers() {
  try {
    // Delete all existing Stripe customers
    await deleteAllStripeCustomers();

    // Delete all existing users in the database
    await UserModel.deleteMany({});

    const users: (Partial<IUser> & { cardToken: string })[] = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'buyer',
        cardToken: 'tok_discover',
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password456',
        role: 'seller',
        cardToken: 'tok_mastercard',
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'adminpass789',
        role: 'seller',
        cardToken: 'tok_amex',
      },
    ];

    for (const userData of users) {
      const { cardToken, ...userDataWithoutToken } = userData;

      // Create Stripe customer
      const stripeCustomer = await stripe.customers.create({
        email: userData.email,
        name: userData.name,
      });

      // Create a payment method
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: { token: cardToken },
      });

      // Attach the payment method to the customer
      await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: stripeCustomer.id,
      });

      // Create user in database
      const user = new UserModel({
        ...userDataWithoutToken,
        stripePaymentMethodId: paymentMethod.id,
        stripeCustomerId: stripeCustomer.id,
      });

      // Save user (this will trigger the pre-save hook to hash the password)
      await user.save();

      logger.info(
        `User created: ${user.name} (${user.email}) with card token: ${cardToken}`,
      );
    }

    logger.info('Users seeded successfully');
  } catch (error) {
    logger.error('Error seeding users:', error);
  }
}

async function deleteAllStripeCustomers() {
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const customers = await stripe.customers.list({
      limit: 100,
      starting_after: startingAfter,
    });

    for (const customer of customers.data) {
      await stripe.customers.del(customer.id);
      logger.info(`Deleted Stripe customer: ${customer.id}`);
    }

    hasMore = customers.has_more;
    if (customers.data.length > 0) {
      startingAfter = customers.data[customers.data.length - 1].id;
    }
  }

  logger.info('All Stripe customers deleted');
}

export { initializeUsers };
