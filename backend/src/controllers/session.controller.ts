import { Request, Response } from 'express';
import { prisma } from '../server';
import { createSessionSchema, completeSessionSchema } from '../validations/session.validation';
import { z } from 'zod';

export const createSession = async (req: Request, res: Response) => {
  try {
    const { body } = createSessionSchema.parse(req);

    // 1. Check if vehicle exists and is not already in an active session
    const vehicle = await prisma.vehicle.findUnique({ where: { id: body.vehicleId } });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    const activeSession = await prisma.parkingSession.findFirst({
      where: { vehicleId: body.vehicleId, status: 'ACTIVE' },
    });
    if (activeSession) {
      return res.status(400).json({ error: 'Vehicle is already parked in an active session.' });
    }

    // 2. Check if slot is available and compatible
    const slot = await prisma.parkingSlot.findUnique({ where: { id: body.slotId } });
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.status !== 'AVAILABLE') return res.status(400).json({ error: 'Slot is not available' });
    if (slot.type !== vehicle.type) return res.status(400).json({ error: `Slot type (${slot.type}) is incompatible with vehicle type (${vehicle.type})` });

    // 3. Create session and update slot status in a transaction
    const [session, updatedSlot] = await prisma.$transaction([
      prisma.parkingSession.create({
        data: {
          vehicleId: body.vehicleId,
          slotId: body.slotId,
        },
      }),
      prisma.parkingSlot.update({
        where: { id: body.slotId },
        data: { status: 'OCCUPIED' },
      })
    ]);

    res.status(201).json(session);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to create parking session' });
  }
};

export const getActiveSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await prisma.parkingSession.findMany({
      where: { status: 'ACTIVE' },
      include: {
        vehicle: true,
        slot: true,
      },
      orderBy: { entryTime: 'desc' },
    });
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active sessions' });
  }
};

export const completeSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { body } = completeSessionSchema.parse(req);

    const session = await prisma.parkingSession.findUnique({
      where: { id },
      include: { slot: true }
    });

    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status === 'COMPLETED') return res.status(400).json({ error: 'Session is already completed' });

    // Calculate fee (simple logic: $5 flat fee + $2 per hour)
    const exitTime = new Date();
    const hoursParked = Math.max(1, Math.ceil((exitTime.getTime() - session.entryTime.getTime()) / (1000 * 60 * 60)));
    const fee = 5 + (hoursParked - 1) * 2;

    // Transaction to update session, slot, and create payment
    const [completedSession, payment, updatedSlot] = await prisma.$transaction([
      prisma.parkingSession.update({
        where: { id },
        data: {
          exitTime,
          status: 'COMPLETED',
          fee,
        },
      }),
      prisma.payment.create({
        data: {
          sessionId: id,
          amount: fee,
          paymentMethod: body.paymentMethod,
          status: 'COMPLETED',
        },
      }),
      prisma.parkingSlot.update({
        where: { id: session.slotId },
        data: { status: 'AVAILABLE' },
      })
    ]);

    res.status(200).json({ session: completedSession, payment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to complete session' });
  }
};
