import mongoose from 'mongoose';
import { config } from './config';
import { logger } from './logger';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongodbUri);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    logger.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
