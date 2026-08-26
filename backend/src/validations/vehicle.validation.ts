import { z } from 'zod';

export const registerVehicleSchema = z.object({
  body: z.object({
    registrationNo: z.string().min(1, 'Registration number is required'),
    type: z.enum(['CAR', 'MOTORCYCLE', 'TRUCK']),
    ownerName: z.string().optional(),
    phoneNumber: z.string().optional(),
  }),
});
