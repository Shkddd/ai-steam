const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'ai-steam-secret-key-2024';

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, is_developer: user.is_developer }, SECRET_KEY, { expiresIn: '7d' });
}

function verifyToken(token) {
  try { return jwt.verify(token, SECRET_KEY); } catch { return null; }
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Invalid token' });
  req.user = decoded;
  next();
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (decoded) req.user = decoded;
  }
  next();
}

module.exports = { generateToken, verifyToken, authMiddleware, optionalAuth };
