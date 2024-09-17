import { app } from './app';
import { config } from './config/config';
import { logger } from './config/logger';
import { connectDB } from './config/database';

const startServer = async () => {
  try {
    await connectDB();
    app.listen(config.port, () => {
      logger.info(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
    });
  } catch (error: any) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
