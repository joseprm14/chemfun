const { verifyAccessToken } = require('../utils/tokens');

module.exports = (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) return res.status(401).json({ error: 'Token requerido' });

  try {
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    const isExpired = err && err.name === 'TokenExpiredError';
    return res.status(401).json({ error: isExpired ? 'Token expirado' : 'Token inválido' });
  }
};