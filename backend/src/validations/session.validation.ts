import { z } from 'zod';

export const createSessionSchema = z.object({
  body: z.object({
    vehicleId: z.string().uuid('Invalid Vehicle ID'),
    slotId: z.string().uuid('Invalid Slot ID'),
  }),
});

export const completeSessionSchema = z.object({
  body: z.object({
    paymentMethod: z.enum(['CASH', 'CARD', 'ONLINE']),
  }),
});
