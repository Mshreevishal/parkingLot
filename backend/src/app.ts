import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import vehicleRoutes from './routes/vehicle.routes';
import slotRoutes from './routes/slot.routes';
import sessionRoutes from './routes/session.routes';

dotenv.config();

const app = express();

// CORS — allow configured origin or all in dev
const allowedOrigin = process.env.FRONTEND_URL || '*';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json());

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'ParkCommand API is running' });
});

// Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/sessions', sessionRoutes);

export default app;
