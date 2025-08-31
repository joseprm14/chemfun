import { classNames, pickRandom, categoryBg } from '@/src/lib/util';


describe('util', () => {
    test('classNames concatena y filtra falsy', () => {
        expect(classNames('a', false && 'b', 'c', null as any)).toBe('a c');
    });


    test('pickRandom devuelve un elemento del array', () => {
        const arr = [1, 2, 3, 4];
        const v = pickRandom(arr);
        expect(arr).toContain(v);
    });


    test('categoryBg devuelve clases esperadas', () => {
        expect(categoryBg('nonmetal')).toMatch(/bg-/);
    });
});