// TODO Check token invalido
process.env.JWT_SECRET = 'integration-test-secret';

const request = require('supertest');
const { startInMemoryMongo, stopInMemoryMongo, clearCollections } = require('../../src/utils/testDb');


let app;
let token;


async function registerAndLogin() {
    await request(app).post('/api/users/register').send({ username: 'p1', password: '123456' });
    const login = await request(app).post('/api/users/login').send({ username: 'p1', password: '123456' });
    return login.body.token;
}


describe('Game API (integration)', () => {
    beforeAll(async () => {
        await startInMemoryMongo();
        app = require('../../src/app');
        token = await registerAndLogin();
    });


    afterAll(async () => {
        await stopInMemoryMongo();
    });


    afterEach(async () => {
        await clearCollections();
        token = await registerAndLogin();
    });


    test('POST /api/game/save guarda partida -> 201', async () => {
        const res = await request(app)
            .post('/api/game/save')
            .set('Authorization', `Bearer ${token}`)
            .send({ mode: 'click', difficulty: 'medio', score: 200, timeTaken: 45 });


        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body).toMatchObject({ mode: 'click', difficulty: 'medio', score: 200, timeTaken: 45 });
    });


    test('GET /api/game/mygames devuelve lista -> 200', async () => {
        await request(app)
            .post('/api/game/save')
            .set('Authorization', `Bearer ${token}`)
            .send({ mode: 'drag', difficulty: 'fácil', score: 150, timeTaken: 60 });


        const res = await request(app)
            .get('/api/game/mygames')
            .set('Authorization', `Bearer ${token}`);


        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
        expect(res.body[0]).toHaveProperty('score', 150);
    });


    test('Validación Joi en /game/save -> 400', async () => {
        const res = await request(app)
            .post('/api/game/save')
            .set('Authorization', `Bearer ${token}`)
            .send({ mode: 'invalid', difficulty: 'medio', score: -1, timeTaken: -5 });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errors');
    });


    test('Protección auth en /game/mygames -> 401', async () => {
        const res = await request(app).get('/api/game/mygames');
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({ error: 'Token requerido' });
    });
});