const request = require('supertest');
const { startInMemoryMongo, stopInMemoryMongo, clearCollections } = require('../../src/utils/testDb');

let app;

describe('Users API (integration)', () => {
  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = 'access-it';
    process.env.JWT_REFRESH_SECRET = 'refresh-it';
    await startInMemoryMongo();
    app = require('../../src/app');
  });

  afterAll(async () => {
    await stopInMemoryMongo();
  });

  afterEach(async () => {
    await clearCollections();
  });

  const strongPass = 'Aa1!aaaa';

  test('register -> 201, luego login -> 200 con token y cookie refresh', async () => {
    const reg = await request(app).post('/api/users/register').send({ username: 'alice', password: strongPass });
    expect(reg.statusCode).toBe(201);

    const login = await request(app).post('/api/users/login').send({ username: 'alice', password: strongPass });
    expect(login.statusCode).toBe(200);
    expect(login.body).toHaveProperty('token');
    // refresh cookie (httpOnly) debe existir
    const cookies = login.headers['set-cookie'] || [];
    expect(cookies.join(';')).toMatch(/refreshToken=/);
  });

  test('login credenciales inválidas -> 401', async () => {
    await request(app).post('/api/users/register').send({ username: 'bob', password: strongPass });
    const res = await request(app).post('/api/users/login').send({ username: 'bob', password: 'Wrong1!' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Credenciales inválidos' });
  });

  test('me y update preferences', async () => {
    await request(app).post('/api/users/register').send({ username: 'carol', password: strongPass });
    const login = await request(app).post('/api/users/login').send({ username: 'carol', password: strongPass });
    const token = login.body.token;

    const me = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
    expect(me.statusCode).toBe(200);
    expect(me.body).toEqual(expect.objectContaining({ username: 'carol', locale: expect.any(String), theme: expect.any(String) }));

    const upd = await request(app)
      .patch('/api/users/me/preferences')
      .set('Authorization', `Bearer ${token}`)
      .send({ locale: 'en', theme: 'dark' });
    expect(upd.statusCode).toBe(200);
    expect(upd.body).toEqual(expect.objectContaining({ locale: 'en', theme: 'dark' }));
  });

  test('refresh-token rota refresh y devuelve nuevo access', async () => {
    await request(app).post('/api/users/register').send({ username: 'dave', password: strongPass });
    const login = await request(app).post('/api/users/login').send({ username: 'dave', password: strongPass });
    const cookie = login.headers['set-cookie'].find(c => c.startsWith('refreshToken='));

    const ref = await request(app).post('/api/users/refresh-token').set('Cookie', cookie);
    expect(ref.statusCode).toBe(200);
    expect(ref.body).toHaveProperty('token');
  });

  test('logout borra refreshToken', async () => {
    await request(app).post('/api/users/register').send({ username: 'erin', password: strongPass });
    const login = await request(app).post('/api/users/login').send({ username: 'erin', password: strongPass });
    const token = login.body.token;
    const cookie = login.headers['set-cookie'].find(c => c.startsWith('refreshToken='));

    const out = await request(app).post('/api/users/logout').set('Authorization', `Bearer ${token}`).set('Cookie', cookie);
    expect(out.statusCode).toBe(200);
    expect(out.body).toEqual({ message: 'Sesión cerrada' });
  });
});
