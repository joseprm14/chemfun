import { renderWithProviders, screen, fireEvent } from '../test-utils';
import { PeriodicTable } from '@/src/components/PeriodicTable';
import { elements } from '@/src/data/elements';
import { TableMask } from '@/src/lib/types';

const mask: TableMask = { showName: false, showSymbol: true, showAtomicNumber: true };

describe('PeriodicTable (unit)', () => {
  test('test-f-u-10 - renderiza algunas celdas y permite click handler', () => {
    const onCellClick = jest.fn();
    const onCellDrop = jest.fn();
    renderWithProviders(
      <PeriodicTable
        mask={mask}
        preview={false}
        onCellClick={onCellClick}
        onCellDrop={onCellDrop}
        enableDrop={false}
        highlightAtomicNumber={null}
        guessed={new Set()}
      />
    );

    // Debe renderizar el símbolo H
    expect(screen.getAllByText('H')[0]).toBeInTheDocument();

    // Click sobre la primera celda que contenga "H"
    fireEvent.click(screen.getAllByText('H')[0]);
    expect(onCellClick).toHaveBeenCalled();
  });
});
