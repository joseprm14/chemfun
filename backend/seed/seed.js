// Inserta datos de ejemplo en la base de datos

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

// Importa los modelos para garantizar índices y esquemas actualizados
const User = require("../src/models/User");
const GameSession = require("../src/models/GameSession");

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

const USERS = [
  // Contraseñas fuertes que cumplen: minúscula, mayúscula, número y carácter especial, ≥ 8 chars
  { username: 'ana',   password: 'Ana!2024',   locale: 'es', theme: 'light' },
  { username: 'bruce', password: 'Bruc3!2024', locale: 'en', theme: 'dark'   },
  { username: 'clara', password: 'Clara#99',   locale: 'es', theme: 'light'  },
  { username: 'david', password: 'Dav1d@2025', locale: 'en', theme: 'dark' }
];

// Algunas partidas de ejemplo para rankings
const SAMPLE_SESSIONS = [
  // mode: click | drag ; difficulty: fácil | medio | difícil
  { u: 'ana',   mode: 'click', difficulty: 'fácil',  score: 1200, timeTaken: 54 },
  { u: 'ana',   mode: 'click', difficulty: 'medio',  score: 980,  timeTaken: 68 },
  { u: 'bruce', mode: 'click', difficulty: 'fácil',  score: 1320, timeTaken: 49 },
  { u: 'bruce', mode: 'drag',  difficulty: 'difícil',score: 760,  timeTaken: 120 },
  { u: 'clara', mode: 'drag',  difficulty: 'medio',  score: 1010, timeTaken: 75 },
  { u: 'david', mode: 'click', difficulty: 'difícil',score: 880,  timeTaken: 102 },
  { u: 'david', mode: 'drag',  difficulty: 'fácil',  score: 1100, timeTaken: 60 }
];

async function connect() {
  const uri = process.env.MONGO_URI;
  await mongoose.connect(uri);
  console.log('✅ Conectado a MongoDB');
}

async function clear() {
  await Promise.allSettled([
    User.deleteMany({}),
    GameSession.deleteMany({})
  ]);
  console.log('🧹 Colecciones limpiadas');
}

function validatePasswordComplexity(pwd) {
  const ok =
    typeof pwd === 'string' &&
    pwd.length >= 8 &&
    /[a-z]/.test(pwd) &&
    /[A-Z]/.test(pwd) &&
    /\d/.test(pwd) &&
    /[^A-Za-z0-9]/.test(pwd);
  if (!ok) throw new Error(`Password no cumple complejidad: "${pwd}"`);
}

async function seedUsers() {
  const docs = [];
  for (const u of USERS) {
    validatePasswordComplexity(u.password);
    const hash = await bcrypt.hash(u.password, saltRounds);
    docs.push({
      username: u.username,
      password: hash,
      locale: u.locale || 'es',
      theme: u.theme || 'system',
      refreshTokenHash: null
    });
  }
  const inserted = await User.insertMany(docs, { ordered: true });
  console.log(`👤 Usuarios insertados: ${inserted.map(x => x.username).join(', ')}`);
  const map = new Map(inserted.map(x => [x.username, x._id]));
  return map; // username -> ObjectId
}

async function seedSessions(userMap) {
  const rows = [];
  for (const s of SAMPLE_SESSIONS) {
    const userId = userMap.get(s.u);
    if (!userId) continue;
    rows.push({
      userId,
      mode: s.mode,
      difficulty: s.difficulty,
      score: s.score,
      timeTaken: s.timeTaken,
      date: new Date()
    });
  }
  if (rows.length) {
    await GameSession.insertMany(rows, { ordered: true });
    console.log(`🎮 Partidas insertadas: ${rows.length}`);
  }
}

async function ensureIndexes() {
  // Asegura la creación de índices compuestos definidos en los modelos
  await Promise.all([
    User.syncIndexes(),
    GameSession.syncIndexes()
  ]);
  console.log('🧱 Índices verificados/creados');
}

async function main() {
  try {
    await connect();
    await clear();
    const userMap = await seedUsers();
    await seedSessions(userMap);
    await ensureIndexes();
    console.log('✅ Seed COMPLETADO');
  } catch (err) {
    console.error('❌ Error en seed:', err?.message || err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

main();