import { classNames, pickRandom, categoryBg } from '@/src/lib/util';


describe('util', () => {
    test('test-f-u-11 - classNames concatena y filtra falsy', () => {
        expect(classNames('a', false && 'b', 'c', null as any)).toBe('a c');
    });


    test('test-f-u-12 - pickRandom devuelve un elemento del array', () => {
        const arr = [1, 2, 3, 4];
        const v = pickRandom(arr);
        expect(arr).toContain(v);
    });


    test('test-f-u-13 - categoryBg devuelve clases esperadas', () => {
        expect(categoryBg('nonmetal')).toMatch(/bg-/);
    });
});