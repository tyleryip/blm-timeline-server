/* eslint-disable @typescript-eslint/no-var-requires */
import { Router } from 'express';
import timeline from './timeline';
import city from './city';
import auth from './auth';

const router = Router();
router.use('/auth', auth);

router.use('/timeline', timeline);
router.use('/city', city);

export default router;
