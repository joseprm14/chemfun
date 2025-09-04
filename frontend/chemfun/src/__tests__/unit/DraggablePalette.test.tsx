
import { renderWithProviders, screen, fireEvent } from '../test-utils';
import { DraggablePalette } from '@/src/components/DraggablePalette';
import { TableMask, ElementData } from '@/src/lib/types';

const elements: ElementData[] = [
  { atomicNumber: 1, symbol: 'H', name: 'Hidrógeno', nameEN: 'Hydrogen', group: 1, period: 1, category: 'nonmetal' },
  { atomicNumber: 2, symbol: 'He', name: 'Helio', nameEN: 'Helium', group: 18, period: 1, category: 'noble' },
];

const mask: TableMask = { showName: false, showSymbol: true, showAtomicNumber: false };

describe('DraggablePalette', () => {
  test('renderiza elementos arrastrables con su símbolo', () => {
    renderWithProviders(<DraggablePalette elements={elements} disabled={false} mask={mask} guessed={new Set()} />);
    expect(screen.getByText('H')).toBeInTheDocument();
    expect(screen.getByText('He')).toBeInTheDocument();
  });

  test('test-f-u-14 - onDragStart adjunta atomicNumber al dataTransfer', () => {
    renderWithProviders(<DraggablePalette elements={elements} disabled={false} mask={mask} guessed={new Set()} />);
    const el = screen.getByText('He').closest('div') as HTMLDivElement;

    const data: Record<string, string> = {};
    const dataTransfer = {
      setData: (k: string, v: string) => { data[k] = v; },
      getData: (k: string) => data[k],
      clearData: () => { for (const k of Object.keys(data)) delete data[k]; },
      dropEffect: 'move',
      effectAllowed: 'all',
      files: [] as any,
      items: [] as any,
      types: [] as any,
    } as unknown as DataTransfer;

    fireEvent.dragStart(el!, { dataTransfer });
    expect(data['text/atomicNumber']).toBe('2');
  });
});
