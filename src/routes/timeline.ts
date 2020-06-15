import { Router, Request, Response } from 'express';
import { query, createID } from '../util/db';
import { QueryResult } from 'pg';
import { requireAuth } from '../util/auth';
import { addCity } from './city';
import TimelinePost, { fromDatabase } from '../models/timelinePost';

const router = Router();

async function checkForCity(name): Promise<void> {
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

router.get('/', (req: Request, res: Response) => {
  query(
    'SELECT * FROM timeline_posts INNER JOIN cities ON timeline_posts.city_name = cities.name ORDER BY date DESC;',
  )
    .then((dbRes: QueryResult<any>) => {
      res.json(dbRes.rows.map((row) => fromDatabase(row)));
    })
    .catch((err: any) => {
      console.log(err.stack);
      res.status(500).json({ error: 'An error occured' });
    });
});

router.post('/', requireAuth, (req: Request, res: Response) => {
  const data: TimelinePost = {
    id: createID(),
    title: req.body?.title.substring(0, 100) || null,
    text: req.body?.text || '',
    cityName: req.body?.cityName || null,
    imageURL: req.body?.imageURL || null,
    newsURL: req.body?.newsURL || null,
    date: new Date(req.body?.date || null),
  };

  if (data.title == null || data.date == null) {
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  checkForCity(data.cityName);

  query(
    `INSERT INTO timeline_posts (id, title, text, city_name, news_url, image_url, date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`,
    [
      data.id,
      data.title,
      data.text,
      data.cityName,
      data.newsURL,
      data.imageURL,
      data.date.toISOString(),
    ],
  )
    .then((dbRes: QueryResult<any>) => {
      res.json(fromDatabase(dbRes.rows[0]));
    })
    .catch((err: any) => {
      console.error(err.stack);
      res.status(500).json({ error: 'An error occured' });
    });
});

export default router;
