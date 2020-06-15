import { Router } from 'express';
import { query, mapKeys } from '../util/db';
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
    'SELECT * FROM timeline_posts INNER JOIN cities ON timeline_posts.city_name = cities.name ORDER BY date DESC;',
  )
    .then((dbRes: QueryResult<any>) => {
      res.json(
        dbRes.rows.map((row) =>
          mapKeys(row, [
            ['city_name', 'cityName'],
            ['news_url', 'newsURL'],
            ['image_url', 'imageURL'],
          ]),
        ),
      );
    })
    .catch((err: any) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.post('/', requireAuth, (req, res) => {
  const data = {
    id: uuid(),
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
      res.json(
        mapKeys(dbRes.rows[0], [
          ['city_name', 'cityName'],
          ['news_url', 'newsURL'],
          ['image_url', 'imageURL'],
        ]),
      );
    })
    .catch((err: any) => {
      res.status(500).json({ error: err });
    });
});

export default router;
