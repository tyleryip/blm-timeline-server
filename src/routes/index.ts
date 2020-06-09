/* eslint-disable @typescript-eslint/no-var-requires */
import { Router } from 'express';

const router = Router();

[
  'timeline'
].forEach(route => {
  router.use(`/${route}`, require(`./${route}`).default);
});

export default router;
