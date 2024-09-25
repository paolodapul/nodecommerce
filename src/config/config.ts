import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  host: process.env.HOST || 'localhost',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || 'stripe_secret_key',
  stripeWebhookSecret:
    process.env.STRIPE_WEBHOOK_SECRET || 'stripe_webhook_secret',
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
  jwtExpiresIn: process.env.JWT_EXPIRE || '30d',
  adminKey: process.env.ADMIN_KEY || 'default-admin-key',
};
