import dotenv from 'dotenv';
import { initializeProducts } from './product.seeder';
import { logger } from '../config/logger';
import { connectDB } from '../config/database';
import { truncateCarts } from './truncate-cart';
import { truncateOrders } from './truncate-orders';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function runSeeders() {
  try {
    await connectDB();
    await initializeProducts();
    await truncateCarts();
    await truncateOrders();
    logger.info('All seeders completed successfully');
  } catch (error) {
    logger.error('Error running seeders:', error);
  }
}

// Check if this script is being run directly (not imported)
if (require.main === module) {
  void runSeeders();
}

export default runSeeders;
