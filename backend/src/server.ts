import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import vehicleRoutes from './routes/vehicle.routes';
import slotRoutes from './routes/slot.routes';
import sessionRoutes from './routes/session.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'ParkCommand API is running' });
});

// Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/sessions', sessionRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
