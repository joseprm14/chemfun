import { buildTableMaskForDifficulty } from '@/src/lib/difficulty';


describe('buildTableMaskForDifficulty', () => {
    test('test-f-u-03 - fácil: muestra número atómico y símbolo en modo click', () => {
        const mask = buildTableMaskForDifficulty('fácil', 'click');
        expect(mask).toEqual({ showName: false, showSymbol: true, showAtomicNumber: true });
    });


    test('test-f-u-04 - medio: número atómico sí, nombre/símbolo no', () => {
        const mask = buildTableMaskForDifficulty('medio', 'drag');
        expect(mask).toEqual({ showName: false, showSymbol: false, showAtomicNumber: true });
    });


    test('test-f-u-05 - difícil: oculta todo', () => {
        const mask = buildTableMaskForDifficulty('difícil', 'click');
        expect(mask).toEqual({ showName: false, showSymbol: false, showAtomicNumber: false });
    });
});