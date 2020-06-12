const requiredPassword = process.env.PASSWORD;

export const requireAuth = (req, res, next) => {
  const authorization = req.headers?.authorization || null;

  if (!authorization) {
    res.status(401).json({
      error: 'Not authorized'
    });

    return;
  }

  const [bearer, password] = authorization.split(' ');
  console.log(requiredPassword);
  if (bearer !== 'Bearer' || password !== requiredPassword) {
    res.status(401).json({
      error: 'Not authorized'
    });

    return;
  }

  next();
};
