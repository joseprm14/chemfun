const auth = require('../../src/middleware/authMiddleware');


jest.mock('jsonwebtoken', () => ({
    verify: jest.fn((token, secret) => {
        if (token === 'valid') return { id: 'user-123' };
        throw new Error('bad token');
    })
}));


describe('authMiddleware (unit)', () => {
    test('sin Authorization -> 401', () => {
        const req = { headers: {} };
        const res = { status: jest.fn().mockReturnValueThis?.() || jest.fn(function(){return this;}), json: jest.fn() };
        const next = jest.fn();


        // pequeño helper para status encadenado
        res.status.mockReturnValue(res);


        auth(req, res, next);


        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Token requerido' });
        expect(next).not.toHaveBeenCalled();
    });


    test('token válido -> next()', () => {
        process.env.JWT_SECRET = 'testing-secret';
        const req = { headers: { authorization: 'Bearer valid' } };
        const res = { status: jest.fn(), json: jest.fn() };
        const next = jest.fn();


        auth(req, res, next);


        expect(req.user).toEqual({ id: 'user-123' });
        expect(next).toHaveBeenCalled();
    });


    test('token inválido -> 403', () => {
        process.env.JWT_SECRET = 'testing-secret';
        const req = { headers: { authorization: 'Bearer invalid' } };
        const res = { status: jest.fn(), json: jest.fn() };
        res.status.mockReturnValue(res);
        const next = jest.fn();


        auth(req, res, next);


        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
        expect(next).not.toHaveBeenCalled();
    });
});