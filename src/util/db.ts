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
      description varchar(500),
      link varchar(2048),
      date date NOT NULL
    );`,
  );
};

export const query = (
  text: string,
  params: Array<any> = [],
): Promise<QueryResult<any>> => {
  return pool.query(text, params);
};
