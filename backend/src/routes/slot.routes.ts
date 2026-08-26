import { Router } from 'express';
import { createSlot, getSlots, updateSlotStatus } from '../controllers/slot.controller';

const router = Router();

router.post('/', createSlot);
router.get('/', getSlots);
router.patch('/:id/status', updateSlotStatus);

export default router;
