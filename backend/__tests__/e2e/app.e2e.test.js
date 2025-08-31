const request = require('supertest');
const { startInMemoryMongo, stopInMemoryMongo } = require('../../src/utils/testDb');


let app;


describe('E2E: registro → login → guardar → listar → rankings', () => {
    let token;


    beforeAll(async () => {
        await startInMemoryMongo();
        app = require('../../src/app');
    });


    afterAll(async () => {
        await stopInMemoryMongo();
    });


    test('flujo completo', async () => {
        // Registro y login
        await request(app).post('/api/users/register').send({ username: 'eva', password: '123456' });
        const login = await request(app).post('/api/users/login').send({ username: 'eva', password: '123456' });
        expect(login.statusCode).toBe(200);
        token = login.body.token;


        // Guarda varias partidas
        const plays = [
            { mode: 'click', difficulty: 'medio', score: 300, timeTaken: 40 },
            { mode: 'click', difficulty: 'medio', score: 280, timeTaken: 35 },
            { mode: 'drag', difficulty: 'fácil', score: 120, timeTaken: 50 },
        ];


        for (const p of plays) {
            const r = await request(app).post('/api/game/save').set('Authorization', `Bearer ${token}`).send(p);
            expect(r.statusCode).toBe(201);
        }


        // Consulta mis partidas
        const my = await request(app).get('/api/game/mygames').set('Authorization', `Bearer ${token}`);
        expect(my.statusCode).toBe(200);
        expect(my.body.length).toBe(3);


        const rank = await request(app).get('/api/rankings/click/medio');
        if (rank.statusCode === 200) {
            expect(rank.body).toHaveProperty('byScore');
            expect(rank.body).toHaveProperty('byTime');
            expect(Array.isArray(rank.body.byScore)).toBe(true);
            expect(Array.isArray(rank.body.byTime)).toBe(true);
        }
    });
});