import { getToken, setToken, clearToken, getMe } from '@/src/lib/api';

describe('api helpers (unit)', () => {
  beforeEach(() => {
    localStorage.clear();
    (global as any).fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({ id: '1', username: 'alice', locale: 'es', theme: 'light' }),
    }));
  });

  test('token helpers', () => {
    expect(getToken()).toBeNull();
    setToken('abc');
    expect(getToken()).toBe('abc');
    clearToken();
    expect(getToken()).toBeNull();
  });

  test('fetch interno añade Authorization si hay token', async () => {
    setToken('jwt123');
    await getMe(); // <- esto usa internamente fetchWithAuth

    // Aserción sobre la llamada a fetch
    const mock = (global as any).fetch as jest.Mock;
    expect(mock).toHaveBeenCalled();

    const [, options] = mock.mock.calls[0];
    expect(options).toEqual(
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer jwt123',
        }),
        credentials: 'include', // lo usa fetchWithAuth
      })
    );
  });
});