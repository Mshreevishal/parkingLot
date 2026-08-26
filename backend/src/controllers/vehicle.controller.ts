import { Request, Response } from 'express';
import { prisma } from '../server';
import { registerVehicleSchema } from '../validations/vehicle.validation';
import { z } from 'zod';

export const registerVehicle = async (req: Request, res: Response) => {
  try {
    const { body } = registerVehicleSchema.parse(req);

    const existingVehicle = await prisma.vehicle.findUnique({
      where: { registrationNo: body.registrationNo },
    });

    if (existingVehicle) {
      return res.status(400).json({ error: 'Vehicle with this registration number already exists.' });
    }

    const vehicle = await prisma.vehicle.create({
      data: body,
    });

    res.status(201).json(vehicle);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ error: 'Failed to register vehicle' });
  }
};

export const getVehicles = async (req: Request, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
};

export const getVehicleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        sessions: {
          orderBy: { entryTime: 'desc' },
          take: 5,
        }
      }
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
};
