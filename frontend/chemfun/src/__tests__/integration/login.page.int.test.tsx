import { renderWithProviders, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/src/app/login/page'; // <-- ruta correcta (App Router)

// --- Mock del router (next/navigation) ---
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/login',
  useSearchParams: () => new URLSearchParams(),
}));

describe('LoginPage (integration)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Limpieza para evitar warnings del I18nProvider y partir de estado limpio
    try { localStorage.removeItem('locale'); localStorage.removeItem('token'); } catch {}
    // Mock global de fetch para que loginUser funcione “de verdad”
    (global as any).fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        token: 'jwt',
        user: { id: '1', username: 'alice', locale: 'es', theme: 'light' },
      }),
    }));
  });

  test('test-f-i-01 - loguea y redirige al home', async () => {
    renderWithProviders(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/usuario/i), 'alice');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /entrar|entrando/i }));

    // Se guarda el token (loginUser llama a setToken internamente)
    await waitFor(() => expect(localStorage.getItem('token')).toBe('jwt'));
    // Se hace replace('/') al terminar
    expect(mockReplace).toHaveBeenCalledWith('/');
  });
});