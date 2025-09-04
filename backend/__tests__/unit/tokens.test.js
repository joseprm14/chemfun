const { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } = require('../../src/utils/tokens');

describe('tokens utils', () => {
  const payload = { id: 'u1' };
  const OLD_ENV = process.env;

  beforeAll(() => {
    process.env = { ...OLD_ENV, JWT_ACCESS_SECRET: 'access-test', JWT_REFRESH_SECRET: 'refresh-test', JWT_ACCESS_TTL: '1h', JWT_REFRESH_TTL: '7d' };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('test-b-u-08 - sign/verify access token', () => {
    const tok = signAccessToken(payload);
    const dec = verifyAccessToken(tok);
    expect(dec).toMatchObject(payload);
    expect(dec).toHaveProperty('iat');
    expect(dec).toHaveProperty('exp');
  });

  test('test-b-u-09 - sign/verify refresh token', () => {
    const tok = signRefreshToken(payload);
    const dec = verifyRefreshToken(tok);
    expect(dec).toMatchObject(payload);
  });
});
