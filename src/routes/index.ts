/* eslint-disable @typescript-eslint/no-var-requires */
import { Router } from 'express';
import timeline from './timeline';
import city from './city';

const router = Router();
router.use('/timeline', timeline);
router.use('/city', city);

export default router;
