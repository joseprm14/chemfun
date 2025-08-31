const express = require('express');
const { registerUser, loginUser, refreshToken, logoutUser, getMe, updatePreferences } = require('../controllers/userController.js');
const router = express.Router();
const validate = require('../middleware/validationMiddleware.js');
const auth = require('../middleware/authMiddleware.js');
const { registerSchema, loginSchema, preferencesSchema } = require('../validators/schemas.js');
const { rateLimit } = require('express-rate-limit');

// Limite de ratio de solicitudes
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Demasiadas solicitudes, inténtalo más tarde.'
});

// Usa el limiter sólo en producción
const maybeLimit = process.env.NODE_ENV === 'production'
  ? authLimiter
  : (req, res, next) => next();

router.post('/register', maybeLimit, validate(registerSchema), registerUser);
router.post('/login', maybeLimit, validate(loginSchema), loginUser);

// Refresh / Logout
router.post('/refresh-token', refreshToken);
router.post('/logout', auth, logoutUser);

// Perfil / preferencias
router.get('/me', auth, getMe);
router.patch('/me/preferences', auth, validate(preferencesSchema), updatePreferences);

module.exports = router;