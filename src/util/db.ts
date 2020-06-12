import { Pool, QueryResult } from 'pg';

let pool: Pool;

export const init = (): void => {
  pool = new Pool({
    connectionString: process.env.DB_URL,
  });

  pool.query(
    `CREATE TABLE IF NOT EXISTS timeline_posts (
      id varchar(36) NOT NULL UNIQUE PRIMARY KEY,
      title varchar(100) NOT NULL,
      text varchar(500),
      cityname varchar(2048) NOT NULL,
      imageURL varchar(2048),
      newsURL varchar(2048) NOT NULL,
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
