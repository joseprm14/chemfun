import { renderWithProviders, screen, userEvent } from '../test-utils';
import MainPage from '@/src/components/MainPage';


jest.mock('@/src/lib/api', () => ({
    __esModule: true,
    saveSession: jest.fn(async () => ({ ok: true })),
    isLoggedIn: jest.fn(() => true),
    getRankings: jest.fn(async () => ({ byScore: [], byTime: [] })),
}));


describe('MainPage (integration)', () => {
    test('renderiza controles básicos', () => {
        renderWithProviders(<MainPage />);
        expect(screen.getByText(/dificultad/i)).toBeInTheDocument();
        expect(screen.getByText(/modo/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /iniciar partida/i })).toBeInTheDocument();
    });


    test('permite iniciar y pausar', async () => {
        renderWithProviders(<MainPage />);
        await userEvent.click(screen.getByRole('button', { name: /iniciar partida/i }));
        expect(await screen.findByRole('button', { name: /pausar/i })).toBeInTheDocument();
    });
});