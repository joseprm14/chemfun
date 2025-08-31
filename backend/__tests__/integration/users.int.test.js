const request = require('supertest');
const { startInMemoryMongo, stopInMemoryMongo, clearCollections } = require('../../src/utils/testDb');


let app;


describe('Users API (integration)', () => {
    beforeAll(async () => {
        await startInMemoryMongo();
        // Requiere app DESPUÉS de establecer MONGO_URI
        app = require('../../src/app');
    });


    afterAll(async () => {
        await stopInMemoryMongo();
    });


    afterEach(async () => {
        await clearCollections();
    });


    test('POST /api/users/register -> 201', async () => {
        const res = await request(app)
        .post('/api/users/register')
        .send({ username: 'alice', password: 'secret123' });


        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({ message: 'Usuario creado correctamente' });
    });


    test('POST /api/users/login -> 200 y token', async () => {
        await request(app).post('/api/users/register').send({ username: 'bob', password: '123456' });
        const res = await request(app).post('/api/users/login').send({ username: 'bob', password: '123456' });


        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
    });


    test('Validación Joi en register -> 400', async () => {
        const res = await request(app).post('/api/users/register').send({ username: 'a', password: '1' });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errors');
    });
});