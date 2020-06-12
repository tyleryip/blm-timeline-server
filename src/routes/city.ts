import { Router } from 'express';
import { QueryResult } from 'pg';
import { query } from '../util/db';
import { v4 as uuid } from 'uuid';
import randomColor from 'randomcolor';
import { requireAuth } from '../util/auth';

const router = Router();

async function generateColour() {
  const cities = await query('SELECT colour FROM cities;');
  let colour: string;
  while (true) {
    let found = true;
    colour = randomColor({luminosity: 'dark'});
    for (const i in cities.rows) {
      if (colour == i) {
        found = false;
        break;
      }
    }
    if (found) {
      return colour;
    }
  }
}

router.get('/', (req, res) => {
  query('SELECT * FROM cities;')
    .then((dbRes: QueryResult<any>) => {
      res.json(dbRes.rows);
    })
    .catch((err: any) => {
      res.status(500).json({ error: err });
    });
});

router.post('/', requireAuth, async (req, res) => {
  const data = {
    id: uuid(),
    name: req.body?.name || null,
    colour: await generateColour() || null,
  };

  if (data.name == null || data.colour == null) {
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  query(
    `INSERT INTO cities (id, name, colour) VALUES ($1, $2, $3) RETURNING *;`,
    [data.id, data.name, data.colour],
  )
    .then((dbRes: QueryResult<any>) => {
      res.json(dbRes.rows[0]);
    })
    .catch((err: any) => {
      res.status(500).json({ error: err });
    });
});

export default router;
