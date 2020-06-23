import { Pool, QueryResult } from 'pg';
import { v4 as uuid } from 'uuid';

let pool: Pool;

export const init = (): void => {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  pool.query(
    `CREATE TABLE IF NOT EXISTS timeline_posts (
      id varchar(36) NOT NULL UNIQUE PRIMARY KEY,
      title TEXT NOT NULL,
      text TEXT,
      city_name TEXT,
      image_url TEXT,
      news_url TEXT NOT NULL,
      date date NOT NULL
    );`,
  );

  pool.query(
    `CREATE TABLE IF NOT EXISTS cities (
      id varchar(36) NOT NULL UNIQUE PRIMARY KEY,
      name varchar(2048) NOT NULL UNIQUE,
      colour varchar(36) NOT NULL UNIQUE
    );`,
  );
};

export const query = (
  text: string,
  params: Array<any> = [],
): Promise<QueryResult<any>> => {
  return pool.query(text, params);
};

export const createID = (): string => uuid().split('-').join('');

export const mapKeys = (
  obj: Record<string, any>,
  mappings: Array<any>,
): Record<string, any> => {
  const newObj = Object.assign({}, obj);

  if (obj != null) {
    mappings.forEach(([from, to]) => {
      if (obj[from] != null) {
        newObj[to] = obj[from];
        delete newObj[from];
      }
    });
  }

  return newObj;
};
