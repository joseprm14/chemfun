const jwt = require('jsonwebtoken');


jest.mock('../../src/models/User', () => ({
  create: jest.fn(),
  findOne: jest.fn(),
}));

jest.mock('bcrypt', () => ({
  // hash simulado para que coincida con la aserción del test
  hash: jest.fn(async (plain) => `hashed:${plain}`),
  // compare se puede sobreescribir en cada test con mockResolvedValue
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  // devolvemos un token fijo y a la vez registramos las llamadas para expect(...)
  sign: jest.fn(() => 'fake.jwt.token'),
}));

// Ahora que los mocks están listos, importamos lo que probamos
const { registerUser, loginUser } = require('../../src/controllers/userController');
const User = require('../../src/models/User');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};


describe('userController (unit)', () => {
    beforeEach(() => jest.clearAllMocks());


    test('registerUser crea usuario y devuelve 201', async () => {
        const req = { body: { username: 'alice', password: 'secret123' } };
        const res = mockRes();
        User.create.mockResolvedValue({ _id: '1', username: 'alice' });


        await registerUser(req, res);


        expect(User.create).toHaveBeenCalledWith({ username: 'alice', password: 'hashed:secret123' });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: 'Usuario creado correctamente' });
    });


    test('registerUser maneja duplicado con 400', async () => {
        const req = { body: { username: 'alice', password: 'x' } };
        const res = mockRes();
        User.create.mockRejectedValue(new Error('duplicate'));


        await registerUser(req, res);


        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Nombre de usuario ya existe' });
    });


    test('loginUser OK devuelve token', async () => {
        const req = { body: { username: 'bob', password: '123456' } };
        const res = mockRes();
        process.env.JWT_SECRET = 'testing-secret';


        require('bcrypt').compare.mockResolvedValue(true);
        User.findOne.mockResolvedValue({ _id: '42', username: 'bob', password: 'hashed:123456' });


        await loginUser(req, res);


        expect(User.findOne).toHaveBeenCalledWith({ username: 'bob' });
        expect(jwt.sign).toHaveBeenCalledWith({ id: '42' }, 'testing-secret');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ token: 'fake.jwt.token' });
    });


    test('loginUser con usuario inexistente -> 401', async () => {
        const req = { body: { username: 'nope', password: 'xx' } };
        const res = mockRes();
        User.findOne.mockResolvedValue(null);


        await loginUser(req, res);


        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Credenciales inválidos' });
    });


    test('loginUser con password inválido -> 401', async () => {
        const req = { body: { username: 'bob', password: 'bad' } };
        const res = mockRes();
        User.findOne.mockResolvedValue({ _id: '42', username: 'bob', password: 'hashed:123' });
        require('bcrypt').compare.mockResolvedValue(false);


        await loginUser(req, res);


        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Credenciales inválidos' });
    });
});