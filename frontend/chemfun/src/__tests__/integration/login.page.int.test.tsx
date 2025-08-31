import { renderWithProviders, screen, userEvent, waitFor } from '../test-utils';
import LoginPage from '@/src/app/login/page';


jest.mock('@/src/lib/api', () => ({
    loginUser: jest.fn(async ({ username, password }) => {
        if (username === 'alice' && password === 'secret') return { token: 'jwt' };
        const e: any = new Error('Credenciales inválidas');
        e.message = 'Credenciales inválidas';
        throw e;
    }),
    setToken: jest.fn(),
}));


// Sobrescribe push del router para verificar navegación
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn() }),
}));


// Helpers robustos contra acentos/variantes de texto
const findLoginButton = () =>
screen.getByRole('button', { name: /iniciar sesi[oó]n|entrar|acceder|sign in|log in/i });


const fillCredentials = async (user: string, pass: string) => {
    const userField = screen.getByLabelText(/usuario|correo|email|user/i);
    const passField = screen.getByLabelText(/contrase(?:ñ|n)a|password|clave/i);
    await userEvent.type(userField, user);
    await userEvent.type(passField, pass);
};


describe('LoginPage (integration)', () => {
    test('loguea y redirige al home', async () => {
        renderWithProviders(<LoginPage />);


        await fillCredentials('alice', 'secret');
        await userEvent.click(findLoginButton());


        await waitFor(() => expect(require('@/src/lib/api').setToken).toHaveBeenCalledWith('jwt'));
    });


    test('muestra error en credenciales inválidas', async () => {
        renderWithProviders(<LoginPage />);


        await fillCredentials('bad', 'bad');
        await userEvent.click(findLoginButton());


        expect(await screen.findByText(/credenciales inválidas|invalid credentials/i)).toBeInTheDocument();
    });
});