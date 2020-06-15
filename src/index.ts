import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import routes from './routes';
import { init as initDB } from './util/db';

initDB();

const port = process.env.PORT;
const app = express();

// Log all routes to console
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method}: ${req.url}`);
  next();
});

app.use(cors());
app.use(bodyParser.json());
app.use(routes);

app.use('*', (req: Request, res: Response) => {
  res.status(401).json({
    error: 'Unauthorized',
  });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
