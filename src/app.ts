import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import userRoutes from './routes/user.routes';
import productRoutes from './routes/product.routes';

export const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

app.use(errorHandler);

app.get('/', (req, res) => {
  res.send('API is running...');
});
