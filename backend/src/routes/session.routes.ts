import { Router } from 'express';
import { createSession, getActiveSessions, completeSession } from '../controllers/session.controller';

const router = Router();

router.post('/', createSession);
router.get('/active', getActiveSessions);
router.post('/:id/complete', completeSession);

export default router;
