const { required } = require('joi');
const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  mode: { type: String, enum: ['click', 'drag'], required: true, index: true },
  difficulty: { type: String, enum: ['fácil', 'medio', 'difícil'], required: true, index: true },
  score: { type: Number, required: true },
  timeTaken: { type: Number, required: true },
  date: { type: Date, default: Date.now, index: true }
},{ versionKey: false });

// Índice para ranking por puntuación (y desempate por tiempo asc)
gameSessionSchema.index({ mode: 1, difficulty: 1, score: -1, timeTaken: 1 });

// Índice para ranking por tiempo (y desempate por puntuación desc)
gameSessionSchema.index({ mode: 1, difficulty: 1, timeTaken: 1, score: -1 });

module.exports = mongoose.model('GameSession', gameSessionSchema);