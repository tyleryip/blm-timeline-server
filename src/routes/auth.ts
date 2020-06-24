import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { QueryResult } from 'pg';
import { query, createID } from '../util/db';
import User, { fromDatabase } from '../models/user';

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_EXPIRY = '15m';
const REFRESH_EXPIRY = '15d';
const SALT_ROUNDS = 10;

const router = Router();

// Generate refresh and access tokens for user
const createTokens = (user: User) => {
  const accessToken = jwt.sign(
    {
      id: user.id,
      isAdmin: user.isAdmin,
      type: 'access',
    },
    JWT_SECRET,
    { expiresIn: ACCESS_EXPIRY },
  );

  const refreshToken = jwt.sign(
    {
      id: user.id,
      isAdmin: user.isAdmin,
      type: 'refresh',
    },
    JWT_SECRET,
    { expiresIn: REFRESH_EXPIRY },
  );

  // Don't return user password
  const userData = { ...user };
  delete userData.password;

  return {
    user: userData,
    accessToken,
    refreshToken,
  };
};

// Handle user signup
router.post('/signup', (req: Request, res: Response) => {
  const data = {
    email: req.body?.email,
    password: req.body?.password,
  };

  if (!data.email || !data.password) {
    res.status(400).json({
      error: 'Invalid request',
    });

    return;
  }

  bcrypt
    .hash(data.password, SALT_ROUNDS)
    .then((hash: string) => {
      query(
        'INSERT INTO users (id, email, password, is_admin) VALUES ($1, $2, $3, $4) RETURNING *;',
        [createID(), data.email, hash, false],
      )
        .then((dbRes: QueryResult<User>) => {
          const user = fromDatabase(dbRes.rows[0]);

          if (!user) {
            console.error('Created account but user doesnt exist...?');
            res.status(500).json({
              error: 'An error occured',
            });

            return;  
          }

          res.json(createTokens(user));
        })
        .catch((err: any) => {
          console.error(err.stack);
          res.status(500).json({
            error: 'An error occured',
          });
        });
    })
    .catch((err: any) => {
      console.error(err.stack);
      res.status(500).json({
        error: 'An error occured',
      });
    });
});

// Handle user login
router.post('/login', (req: Request, res: Response) => {
  const data = {
    email: req.body?.email,
    password: req.body?.password,
  };

  if (!data.email || !data.password) {
    res.status(400).json({
      error: 'Invalid login',
    });

    return;
  }

  // Get user from database
  query('SELECT * FROM users WHERE email = $1;', [data.email])
    .then((dbRes: QueryResult<User>) => {
      const user = fromDatabase(dbRes.rows[0]);

      // Check if user exists
      if (!user) {
        console.log('user not exist');
        res.status(400).json({
          error: 'Invalid login',
        });
        return;
      }

      // Verify password
      bcrypt
        .compare(data.password, user.password)
        .then((valid: boolean) => {
          if (!valid) {
            console.log('bad password');
            res.status(400).json({
              error: 'Invalid login',
            });
            return;
          }

          // Create and return access & refresh tokens
          res.json(createTokens(user));
        })
        .catch((err: any) => {
          console.error(err.stack);
          res.status(500).json({
            error: 'An error occured',
          });
        });
    })
    .catch((err: any) => {
      console.error(err.stack);
      res.status(500).json({
        error: 'An error occured',
      });
    });
});

// Handle user token refresh
router.post('/refresh', (req: Request, res: Response) => {
  // TODO: implement refresh tokens
});

export default router;
