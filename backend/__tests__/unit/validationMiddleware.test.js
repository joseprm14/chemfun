const validate = require('../../src/middleware/validationMiddleware');
const Joi = require('joi');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('validationMiddleware', () => {
  const schema = Joi.object({ a: Joi.number().integer().min(0).required() });

  test('test-b-u-22 - pasa cuando valida OK', () => {
    const req = { body: { a: 3 } };
    const res = mockRes();
    const next = jest.fn();
    validate(schema)(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('test-b-u-23 - responde 400 con lista de errores cuando invalida', () => {
    const req = { body: { a: -1 } };
    const res = mockRes();
    const next = jest.fn();
    validate(schema)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.any(Array) }));
    expect(next).not.toHaveBeenCalled();
  });
});
