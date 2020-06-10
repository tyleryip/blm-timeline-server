/* eslint-disable @typescript-eslint/no-var-requires */
import { Router } from 'express';
import timeline from './timeline';

const router = Router();
router.use('/timeline', timeline);

export default router;
