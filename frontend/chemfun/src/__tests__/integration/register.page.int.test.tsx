
import { renderWithProviders, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import RegisterPage from '@/src/app/register/page';

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
  usePathname: () => '/register',
}));

// --- Mock API ---
const registerSpy = jest.fn();
const loginSpy = jest.fn();
jest.mock('@/src/lib/api', () => ({
  ...(jest.requireActual('@/src/lib/api')),
  registerUser: (...args: any[]) => registerSpy(...args),
  loginUser: (...args: any[]) => loginSpy(...args),
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    registerSpy.mockReset();
    loginSpy.mockReset();
    mockReplace.mockReset();
  });

  test('muestra formulario de registro', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByRole('heading', { name: /registrarse|register/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrarse|register|creando/i })).toBeInTheDocument();
  });

  test('valida y registra al usuario; luego hace login y redirige', async () => {
    registerSpy.mockResolvedValue({ ok: true });
    loginSpy.mockResolvedValue(true);

    renderWithProviders(<RegisterPage />);

    await userEvent.type(screen.getByLabelText(/usuario/i), 'bob');
    await userEvent.type(screen.getByLabelText(/^contraseña/i), 'Abcdef1!'); // fuerte según strongEnough
    // si hay campo repetir contraseña, intenta rellenarlo también si existe
    const repeat = screen.queryByLabelText(/repetir.*contraseña|confirm/i);
    if (repeat) {
      await userEvent.type(repeat, 'Abcdef1!');
    }

    await userEvent.click(screen.getByRole('button', { name: /registrarse|register/i }));

    await waitFor(() => expect(registerSpy).toHaveBeenCalled());
    expect(registerSpy.mock.calls[0][0]).toMatchObject({ username: 'bob' });
    await waitFor(() => expect(loginSpy).toHaveBeenCalledWith({ username: 'bob', password: 'Abcdef1!' }));
    expect(mockReplace).toHaveBeenCalledWith('/');
  });
});
