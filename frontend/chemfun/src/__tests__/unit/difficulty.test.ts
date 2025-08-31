import { buildTableMaskForDifficulty } from '@/src/lib/difficulty';


describe('buildTableMaskForDifficulty', () => {
    test('fácil: muestra número atómico y símbolo en modo click', () => {
        const mask = buildTableMaskForDifficulty('facil', 'click');
        expect(mask).toEqual({ showName: false, showSymbol: true, showAtomicNumber: true });
    });


    test('medio: número atómico sí, nombre/símbolo no', () => {
        const mask = buildTableMaskForDifficulty('medio', 'drag');
        expect(mask).toEqual({ showName: false, showSymbol: false, showAtomicNumber: true });
    });


    test('difícil: oculta todo', () => {
        const mask = buildTableMaskForDifficulty('dificil', 'click');
        expect(mask).toEqual({ showName: false, showSymbol: false, showAtomicNumber: false });
    });
});