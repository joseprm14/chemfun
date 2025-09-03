/**
 * Integra MainPage y resuelve al menos un acierto de forma determinista
 * Mockeamos pickRandom para que el primer objetivo sea Hidrógeno (H, #1)
 */
import { renderWithProviders, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import MainPage from '@/src/components/MainPage';

jest.mock('@/src/lib/api', () => ({
  __esModule: true,
  saveSession: jest.fn(async () => ({ ok: true })),
  isLoggedIn: jest.fn(() => true),
  getRankings: jest.fn(async () => ({ byScore: [], byTime: [] })),
}));

jest.mock('@/src/lib/util', () => ({
  ...jest.requireActual('@/src/lib/util'),
  pickRandom: (arr: any[]) => arr.find((e: any) => e.atomicNumber === 1), // Hydrogen
}));

describe('MainPage (integration solve one correct pick)', () => {
  test('modo click: acierta Hidrógeno incrementando marcador', async () => {
    renderWithProviders(<MainPage />);
    const { getRankings } = require('@/src/lib/api');
    await waitFor(() => expect(getRankings).toHaveBeenCalled());
    await userEvent.click(screen.getByRole('button', { name: /iniciar partida|start game/i }));

    // Hacer click en la celda "H" (símbolo del Hidrógeno)
    await userEvent.click(screen.getAllByText(/^H$/)[0]);

    // ✅ El marcador (ScoreBar) debería mostrar 1 en la PRIMERA tarjeta lateral de "Puntuación"
    const scoreLabel = screen.getAllByText(/puntuación|score/i)[0];
    const scoreValueEl = scoreLabel.parentElement?.querySelector('div.text-2xl') as HTMLElement;
    expect(scoreValueEl).toHaveTextContent('1');
  });
});
