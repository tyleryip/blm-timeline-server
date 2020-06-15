import { Request, Response, NextFunction } from "express";

const requiredPassword = process.env.PASSWORD;

export const requireAuth = (req: Request, res: Response, next: NextFunction): any => {
  const authorization = req.headers?.authorization || null;

  if (!authorization) {
    res.status(401).json({
      error: 'Not authorized'
    });

    return;
  }

  const [bearer, password] = authorization.split(' ');
  if (bearer !== 'Bearer' || password !== requiredPassword) {
    res.status(401).json({
      error: 'Not authorized'
    });

    return;
  }

  next();
};
