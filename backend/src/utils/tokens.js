const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'secretaccesstoken';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'secretrefreshtoken';
const ACCESS_TTL   = process.env.JWT_ACCESS_TTL || '15m';
const REFRESH_TTL  = process.env.JWT_REFRESH_TTL || '7d';

const signAccessToken = (payload) =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TTL });

const signRefreshToken = (payload) =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TTL });

const verifyAccessToken = (token) =>
  jwt.verify(token, ACCESS_SECRET);

const verifyRefreshToken = (token) =>
  jwt.verify(token, REFRESH_SECRET);

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};