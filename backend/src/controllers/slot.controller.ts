import { Request, Response } from 'express';
import { prisma } from '../server';
import { createSlotSchema, updateSlotStatusSchema } from '../validations/slot.validation';
import { z } from 'zod';

export const createSlot = async (req: Request, res: Response) => {
  try {
    const { body } = createSlotSchema.parse(req);

    const existingSlot = await prisma.parkingSlot.findUnique({
      where: { slotNumber: body.slotNumber },
    });

    if (existingSlot) {
      return res.status(400).json({ error: 'Slot with this number already exists.' });
    }

    const slot = await prisma.parkingSlot.create({
      data: body,
    });

    res.status(201).json(slot);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ error: 'Failed to create slot' });
  }
};

export const getSlots = async (req: Request, res: Response) => {
  try {
    const slots = await prisma.parkingSlot.findMany({
      orderBy: { slotNumber: 'asc' },
      include: {
        parkingLot: true,
      }
    });
    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
};

export const updateSlotStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { body } = updateSlotStatusSchema.parse(req);

    const slot = await prisma.parkingSlot.update({
      where: { id },
      data: { status: body.status },
    });

    res.status(200).json(slot);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ error: 'Failed to update slot status' });
  }
};
