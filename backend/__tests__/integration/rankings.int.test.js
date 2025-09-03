const request = require('supertest');
const mongoose = require('mongoose');
const { startInMemoryMongo, stopInMemoryMongo, clearCollections } = require('../../src/utils/testDb');
const User = require('../../src/models/User');
const GameSession = require('../../src/models/GameSession');

let app;
const strongPass = 'Aa1!aaaa';

describe('Rankings API (integration)', () => {
  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = 'access-it';
    process.env.JWT_REFRESH_SECRET = 'refresh-it';
    await startInMemoryMongo();
    app = require('../../src/app');
  });

  afterAll(async () => { await stopInMemoryMongo(); });
  afterEach(async () => { await clearCollections(); });

  test('ranking devuelve byScore y byTime ordenados', async () => {
    const u1 = await User.create({ username: 'u1', password: 'x' });
    const u2 = await User.create({ username: 'u2', password: 'y' });

    await GameSession.create([
      { userId: u1._id, mode: 'click', difficulty: 'fácil', score: 10, timeTaken: 30 },
      { userId: u1._id, mode: 'click', difficulty: 'fácil', score: 12, timeTaken: 28 },
      { userId: u2._id, mode: 'click', difficulty: 'fácil', score: 11, timeTaken: 20 },
      { userId: u2._id, mode: 'click', difficulty: 'fácil', score: 7,  timeTaken: 15 },
    ]);

    const res = await request(app).get('/api/rankings/click/fácil');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('byScore');
    expect(res.body).toHaveProperty('byTime');
    expect(Array.isArray(res.body.byScore)).toBe(true);
    expect(Array.isArray(res.body.byTime)).toBe(true);
  });
});
