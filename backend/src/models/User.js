const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },

  // Persistencia de preferencias
  locale: { type: String, enum: ['es', 'en'], default: 'es' },
  theme:  { type: String, enum: ['light', 'dark'], default: 'light' },

  // Refresh token (hash, por seguridad)
  refreshTokenHash: { type: String, default: null }
});

module.exports = mongoose.model('User', userSchema);