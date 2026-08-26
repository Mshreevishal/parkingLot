import { z } from 'zod';

export const createSlotSchema = z.object({
  body: z.object({
    slotNumber: z.string().min(1, 'Slot number is required'),
    type: z.enum(['CAR', 'MOTORCYCLE', 'TRUCK']),
    parkingLotId: z.string().uuid('Invalid Parking Lot ID'),
  }),
});

export const updateSlotStatusSchema = z.object({
  body: z.object({
    status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE']),
  }),
});
