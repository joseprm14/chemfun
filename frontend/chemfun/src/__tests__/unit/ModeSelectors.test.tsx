import { renderWithProviders, screen } from '../test-utils';
import { ModeSelectors } from '@/src/components/ModeSelectors';
import userEvent from '@testing-library/user-event';

describe('ModeSelectors (unit)', () => {
  test('test-f-u-08 - permite cambiar de modo y dificultad cuando no está bloqueado', async () => {
    const setMode = jest.fn();
    const setDifficulty = jest.fn();

    renderWithProviders(<ModeSelectors mode="click" setMode={setMode} difficulty="facil" setDifficulty={setDifficulty} />);
    await userEvent.click(screen.getByRole('button', { name: /drag|arrastrar/i }));
    expect(setMode).toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: /medio|medium/i }));
    expect(setDifficulty).toHaveBeenCalled();
  });

  test('test-f-u-09 - cuando está bloqueado no dispara handlers', async () => {
    const setMode = jest.fn();
    const setDifficulty = jest.fn();

    renderWithProviders(<ModeSelectors mode="click" difficulty="facil" />);
    const dragBtn = screen.getByRole('button', { name: /drag|arrastrar/i });
    await userEvent.click(dragBtn);
    expect(setMode).not.toHaveBeenCalled();
  });
});
