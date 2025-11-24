// authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log('Authorization:', authHeader);
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token tidak ditemukan' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Token invalid:', err.message);
      return res.status(403).json({ message: 'Token tidak valid' });
    }
    req.user = user;
    next();
  });
}

function authenticateAdmin(req, res, next) {
  if (req.user.role_id !== 1) {
    return res.status(403).json({ message: 'Forbidden: hanya admin yang boleh akses' });
  }
  next();
}

module.exports = {
  authenticateToken,
  authenticateAdmin
};
