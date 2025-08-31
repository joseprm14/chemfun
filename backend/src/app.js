const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const userRoutes = require('./routes/userRoutes.js');
const gameRoutes = require('./routes/gameRoutes.js');
const rankingRoutes = require('./routes/rankingRoutes.js');

dotenv.config();
const app = express();

// Seguridad de cabeceras sólo en producción
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: false
  }));
}

// CORS estricto
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const corsOptionsProd = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origen no permitido por CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
  maxAge: 600
};

if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: true, credentials: true }));
} else {
  app.use(cors(corsOptionsProd));
}

app.use(cookieParser());
app.use(express.json());

app.set('trust proxy', 1);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB conectado'))
    .catch(err => console.error(err));

app.use('/api/users', userRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/rankings', rankingRoutes);


module.exports = app;