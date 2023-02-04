const jwt = require('jsonwebtoken');

module.exports = (role) => {
  return (req, res, next) => {
    if (req.method === 'OPTIONS') {
      next();
    }
    try {
      const token = req.headers.authorization.split(' ')[1];
      if (!token) {
        res.status(401).json({ message: 'Не авторизован' });
      }
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      if (decoded.role !== role) {
        res.status(401).json({ message: 'Не достаточно прав' });
      }
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Не авторизован' });
    }
  };
};
