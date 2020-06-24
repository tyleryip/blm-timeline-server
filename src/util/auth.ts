import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to require user authentication for route
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): any => {
  // Ensure authorization header is present and in the correct format
  const authorization = req.headers?.authorization || null;

  if (!authorization) {
    res.status(401).json({
      error: 'Unauthorized',
    });

    return;
  }

  const [bearer, token] = authorization.split(' ');
  if (bearer !== 'Bearer' || !token) {
    res.status(401).json({
      error: 'Unauthorized',
    });

    return;
  }

  // Verify token validity
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.type !== 'access') {
      throw 'Not correct type of token';
    }

    req.jwt = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      error: 'Invalid token',
    });
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): any => {
  if (!req.jwt?.isAdmin) {
    res.status(401).json({
      error: 'Unauthorized',
    });
    return;
  }

  next();
};
