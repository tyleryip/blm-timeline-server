const requiredPassword = process.env.PASSWORD;

export const requireAuth = (req: any, res: any, next: any): any => {
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
