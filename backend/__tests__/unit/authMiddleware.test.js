jest.mock('../../src/utils/tokens', () => ({
  verifyAccessToken: jest.fn((tok) => {
    if (tok === 'valid') return { id: 'user-123' };
    const err = new Error('bad'); err.name = tok === 'expired' ? 'TokenExpiredError' : 'JsonWebTokenError'; throw err;
  }),
}));

const { verifyAccessToken } = require('../../src/utils/tokens');
const auth = require('../../src/middleware/authMiddleware');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authMiddleware', () => {
  test('sin Authorization -> 401', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();
    auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token requerido' });
    expect(next).not.toHaveBeenCalled();
  });

  test('token válido -> next()', () => {
    const req = { headers: { authorization: 'Bearer valid' } };
    const res = mockRes();
    const next = jest.fn();
    auth(req, res, next);
    expect(verifyAccessToken).toHaveBeenCalledWith('valid');
    expect(req.user).toEqual({ id: 'user-123' });
    expect(next).toHaveBeenCalled();
  });

  test('token expirado -> 401 "Token expirado"', () => {
    const req = { headers: { authorization: 'Bearer expired' } };
    const res = mockRes();
    const next = jest.fn();
    auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token expirado' });
  });

  test('token inválido -> 401 "Token inválido"', () => {
    const req = { headers: { authorization: 'Bearer nope' } };
    const res = mockRes();
    const next = jest.fn();
    auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
  });
});
