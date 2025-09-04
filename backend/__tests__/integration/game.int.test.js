const request = require('supertest');
const { startInMemoryMongo, stopInMemoryMongo, clearCollections } = require('../../src/utils/testDb');

let app;
let token;
const strongPass = 'Aa1!aaaa';

async function registerAndLogin(username='p1') {
  await request(app).post('/api/users/register').send({ username, password: strongPass });
  const login = await request(app).post('/api/users/login').send({ username, password: strongPass });
  return login.body.token;
}

describe('Game API (integration)', () => {
  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = 'access-it';
    process.env.JWT_REFRESH_SECRET = 'refresh-it';
    await startInMemoryMongo();
    app = require('../../src/app');
  });

  afterAll(async () => { await stopInMemoryMongo(); });
  afterEach(async () => { await clearCollections(); });

  test('test-b-i-01 - guardar partida y consultar mis partidas', async () => {
    token = await registerAndLogin('player1');
    const save = await request(app)
      .post('/api/game/save')
      .set('Authorization', `Bearer ${token}`)
      .send({ mode: 'click', difficulty: 'fácil', score: 5, timeTaken: 12 });
    expect(save.statusCode).toBe(201);
    expect(save.body).toEqual(expect.objectContaining({ mode: 'click', difficulty: 'fácil', score: 5, timeTaken: 12 }));

    const my = await request(app).get('/api/game/mygames').set('Authorization', `Bearer ${token}`);
    expect(my.statusCode).toBe(200);
    expect(my.body).toHaveLength(1);
  });

  test('test-b-i-02 - validación Joi -> 400', async () => {
    token = await registerAndLogin('player2');
    const res = await request(app)
      .post('/api/game/save')
      .set('Authorization', `Bearer ${token}`)
      .send({ mode: 'invalid', difficulty: 'medio', score: -1, timeTaken: -5 });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  test('test-b-i-03 - protección auth en /game/mygames -> 401', async () => {
    const res = await request(app).get('/api/game/mygames');
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Token requerido' });
  });
});
