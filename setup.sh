#!/bin/bash

set -euo pipefail

echo "Initializing TypeScript Node.js project with MongoDB Atlas integration..."


# Initialize project and set up package.json
npm init -y
npm pkg set type="module" \
    scripts.start="node dist/server.js" \
    scripts.dev="cross-env NODE_ENV=development nodemon --exec ts-node src/server.ts" \
    scripts.build="tsc" \
    scripts.test="jest" \
    scripts.lint="eslint . --ext .ts" \
    scripts.format="prettier --write \"src/**/*.ts\""

# Install dependencies
npm i express dotenv mongoose morgan winston cors helmet express-validator

# Install dev dependencies
npm i -D typescript @types/node @types/express @types/mongoose @types/morgan @types/cors @types/helmet \
    ts-node nodemon jest ts-jest @types/jest supertest @types/supertest \
    eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin \
    prettier eslint-config-prettier eslint-plugin-prettier cross-env

# Create TypeScript configuration
cat > tsconfig.json << EOL
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "lib": ["ES2020"],
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.spec.ts"]
}
EOL

# Create project structure
mkdir -p src/{config,controllers,middleware,models,routes,services,utils} tests/{unit,integration}

# Create essential files
touch src/{server.ts,app.ts} src/config/{database.ts,logger.ts} \
    src/middleware/{errorHandler.ts,validate.ts} \
    src/utils/{asyncHandler.ts,ApiError.ts}

# Create .env.example
cat > .env.example << EOL
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
EOL

# Create .gitignore
cat > .gitignore << EOL
node_modules
dist
.env
*.log
coverage
EOL

# Create basic server.ts
cat > src/server.ts << EOL
import { app } from './app';
import { config } from './config/config';
import { logger } from './config/logger';
import { connectDB } from './config/database';

const startServer = async () => {
  try {
    await connectDB();
    app.listen(config.port, () => {
      logger.info(\`Server running in \${config.nodeEnv} mode on port \${config.port}\`);
    });
  } catch (error: any) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
EOL

# Create basic app.ts
cat > src/app.ts << EOL
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/config';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './config/logger';

export const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes will be added here

app.use(errorHandler);

app.get('/', (req, res) => {
  res.send('API is running...');
});
EOL

# Create config.ts
cat > src/config/config.ts << EOL
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
  jwtExpiresIn: process.env.JWT_EXPIRE || '30d',
};
EOL

# Create database.ts
cat > src/config/database.ts << EOL
import mongoose from 'mongoose';
import { config } from './config';
import { logger } from './logger';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongodbUri);
    logger.info(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error: any) {
    logger.error(\`Error: \${error.message}\`);
    process.exit(1);
  }
};
EOL

# Create logger.ts
cat > src/config/logger.ts << EOL
import winston from 'winston';
import { config } from './config';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const env = config.nodeEnv || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => \`\${info.timestamp} \${info.level}: \${info.message}\`,
  ),
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  new winston.transports.File({ filename: 'logs/all.log' }),
];

export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});
EOL

echo "Project structure created successfully!"
echo "Next steps:"
echo "1. Review and customize the generated files"
echo "2. Set up your .env file with your MongoDB Atlas connection string"
echo "3. Implement your models, controllers, and routes"
echo "4. Run 'npm run dev' to start the development server"
