
import { renderWithProviders, screen, waitFor, within } from '../test-utils';
import userEvent from '@testing-library/user-event';
import RankingsPage from '@/src/app/rankings/page';

// Mock API
const getRankingsSpy = jest.fn();
jest.mock('@/src/lib/api', () => ({
  ...(jest.requireActual('@/src/lib/api')),
  getRankings: (...args: any[]) => getRankingsSpy(...args),
}));

const SAMPLE = {
  byScore: [
    { username: 'alice', score: 95, timeTaken: 42 },
    { username: 'bob', score: 90, timeTaken: 50 },
  ],
  byTime: [
    { username: 'carol', score: 88, timeTaken: 35 },
    { username: 'dave', score: 80, timeTaken: 36 },
  ],
};

describe('RankingsPage', () => {
  beforeEach(() => {
    getRankingsSpy.mockReset();
    getRankingsSpy.mockResolvedValue(SAMPLE);
  });

  test('test-f-i-05 - carga y muestra rankings por puntuación y por tiempo', async () => {
    renderWithProviders(<RankingsPage />);

    // Se muestra estado de carga inicialmente si existe
    // Luego aparecen tablas
    await waitFor(() => expect(getRankingsSpy).toHaveBeenCalled());

    await screen.findByText(/mejores por\s*\S*\s*puntuación/i);
    await screen.findByText(/mejores por\s*\S*\s*tiempo/i);

    // Deberían renderizarse las filas de datos
    const rows = await screen.findAllByRole('row');
    expect(rows.length).toBeGreaterThanOrEqual(3);

    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('carol')).toBeInTheDocument();
  });

  test('test-f-i-06 - cambiar modo o dificultad vuelve a consultar', async () => {
    renderWithProviders(<RankingsPage />);
    await waitFor(() => expect(getRankingsSpy).toHaveBeenCalledTimes(1));

    const selects = screen.getAllByRole('combobox');
    const modeSelect = selects[0];
    const diffSelect = selects[1];

    await userEvent.selectOptions(modeSelect, 'drag');
    await waitFor(() => expect(getRankingsSpy).toHaveBeenCalledTimes(2));

    await userEvent.selectOptions(diffSelect, 'medio');
    await waitFor(() => expect(getRankingsSpy).toHaveBeenCalledTimes(3));
  });
});
