import { Router } from 'express';
import { registerVehicle, getVehicles, getVehicleById } from '../controllers/vehicle.controller';

const router = Router();

router.post('/', registerVehicle);
router.get('/', getVehicles);
router.get('/:id', getVehicleById);

export default router;
