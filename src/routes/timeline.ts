import { Router } from 'express';
import { query } from '../util/db';
import { QueryResult } from 'pg';
import { v4 as uuid } from 'uuid';

const router = Router();

router.get('/', (req, res) => {
  query('SELECT * FROM timeline_posts')
    .then((dbRes: QueryResult<any>) => {
      res.json(dbRes.rows);
    })
    .catch((err: any) => {
      res.status(500).json({ error: err });
    });
});

router.post('/', (req, res) => {
  const data = {
    id: uuid(),
    title: req.body?.title || null,
    description: req.body?.description || '',
    link: req.body?.link || null,
    date: new Date(req.body?.date || null),
  };

  if (data.title == null || data.date == null) {
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  query(
    'INSERT INTO timeline_posts (id, title, description, link, date) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
    [data.id, data.title, data.description, data.link, data.date.toISOString()],
  )
    .then((dbRes: QueryResult<any>) => {
      res.json(dbRes.rows[0])
    })
    .catch((err: any) => {
      res.status(500).json({ error: err });
    });
});

export default router;
