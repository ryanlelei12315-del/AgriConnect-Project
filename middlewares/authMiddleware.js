const { getToken, verifyToken } = require('./pageAuth');
require('dotenv').config();

module.exports = (req, res, next) => {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Missing Authorization token' });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  req.user = payload; // payload contains { id, email, role }
  next();
};
