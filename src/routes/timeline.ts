import { Router } from 'express';
import { query } from '../util/db';
import { QueryResult } from 'pg';
import { v4 as uuid } from 'uuid';
import { requireAuth } from '../util/auth';
import { addCity } from './city';

const router = Router();

async function checkForCity(name) {
  const cities = await query('SELECT name FROM cities;');
  //if city is in db, do nothing
  for (const i in cities.rows) {
    if (name == i) {
      return;
    }
  }
    //if city is not in db, create it
  addCity(name);
}

router.get('/', (req, res) => {
  query(
    'SELECT * FROM timeline_posts INNER JOIN cities ON timeline_posts.cityname = cities.name;',
  )
    .then((dbRes: QueryResult<any>) => {
      res.json(dbRes.rows);
    })
    .catch((err: any) => {
      res.status(500).json({ error: err });
    });
});

router.post('/', requireAuth, (req, res) => {
  const data = {
    id: uuid(),
    title: req.body?.title || null,
    text: req.body?.text || '',
    cityname: req.body?.cityname || null,
    imageURL: req.body?.imageURL || null,
    newsURL: req.body?.newsURL || null,
    date: new Date(req.body?.date || null),
  };

  if (data.title == null || data.date == null) {
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  checkForCity(data.cityname);

  query(
    `INSERT INTO timeline_posts (id, title, text, cityname, newsURL, imageURL, date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`,
    [
      data.id,
      data.title,
      data.text,
      data.cityname,
      data.newsURL,
      data.imageURL,
      data.date.toISOString(),
    ],
  )
    .then((dbRes: QueryResult<any>) => {
      res.json(dbRes.rows[0]);
    })
    .catch((err: any) => {
      res.status(500).json({ error: err });
    });
});

export default router;
