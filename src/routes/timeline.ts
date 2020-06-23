import { Router, Request, Response } from 'express';
import { query, createID } from '../util/db';
import { QueryResult } from 'pg';
import { requireAuth } from '../util/auth';
import { addCity } from './city';
import TimelinePost, { fromDatabase } from '../models/timelinePost';

const router = Router();

function sanitize(string: string) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  const reg = /[&<>"'/]/gi;
  return string.replace(reg, (match) => map[match]);
}

async function checkForCity(name: string): Promise<void> {
  const cities = await query('SELECT name FROM cities;');
  //if city is in db, do nothing
  for (const i in cities.rows) {
    if (name === cities.rows[i]?.name) {
      return;
    }
  }
  //if city is not in db, create it
  addCity(name);
}

router.get('/', (req: Request, res: Response) => {
  query(
    `SELECT timeline_posts.id, title, text, city_name, colour, image_url, news_url, date FROM timeline_posts
      INNER JOIN cities ON timeline_posts.city_name = cities.name ORDER BY date DESC;`,
  )
    .then((dbRes: QueryResult<TimelinePost>) => {
      res.json(dbRes.rows.map((row) => fromDatabase(row)));
    })
    .catch((err: any) => {
      console.error(err.stack);
      res.status(500).json({ error: 'An error occured' });
    });
});

router.post('/', requireAuth, (req: Request, res: Response) => {
  const data: TimelinePost = {
    id: createID(),
    title: req.body?.title?.substring(0, 100) || null,
    text: req.body?.text || '',
    cityName: req.body?.cityName?.toLowerCase() || null,
    imageURL: req.body?.imageURL || null,
    newsURL: req.body?.newsURL || null,
    date: new Date(req.body?.date || null),
  };

  if (data.title == null || data.date == null) {
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  if (data.cityName != null) {
    checkForCity(data.cityName);
  }

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
    .then((dbRes: QueryResult<TimelinePost>) => {
      res.json(fromDatabase(dbRes.rows[0]));
    })
    .catch((err: any) => {
      console.error(err.stack);
      res.status(500).json({ error: 'An error occured' });
    });
});

router.patch('/:postId', requireAuth, (req: Request, res: Response) => {
  const postId = req.params?.postId;

  if (!postId) {
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  const data: TimelinePost = {
    id: postId,
    title: req.body?.title?.substring(0, 100) || null,
    text: req.body?.text || null,
    cityName: req.body?.cityName || null,
    imageURL: req.body?.imageURL || null,
    newsURL: req.body?.newsURL || null,
    date: new Date(req.body?.date || null),
  };

  if (data.cityName != null) {
    checkForCity(data.cityName);
  }

  query(
    `UPDATE timeline_posts SET
      title = COALESCE($1, title),
      text = COALESCE($2, text),
      city_name = COALESCE($3, city_name),
      image_url = COALESCE($4, image_url),
      news_url = COALESCE($5, news_url),
      date = COALESCE($6, date)
    WHERE id = $7 RETURNING *;`,
    [
      data.title,
      data.text,
      data.cityName,
      data.imageURL,
      data.newsURL,
      data.date,
      data.id,
    ],
  )
    .then((dbRes: QueryResult<TimelinePost>) => {
      res.json(fromDatabase(dbRes.rows[0]));
    })
    .catch((err: any) => {
      console.error(err.stack);
      res.status(500).json({ error: 'An error occured' });
    });
});

router.delete('/:postId', requireAuth, (req: Request, res: Response) => {
  const postId = req.params?.postId;

  if (!postId) {
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  query(`DELETE FROM timeline_posts WHERE id = $1 RETURNING *;`, [postId])
    .then((dbRes: QueryResult<TimelinePost>) => {
      res.json(fromDatabase(dbRes.rows[0]));
    })
    .catch((err: any) => {
      console.error(err);
      res.status(500).json({ error: 'An error occured' });
    });
});

export default router;
