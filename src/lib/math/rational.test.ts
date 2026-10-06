import { describe, expect, it } from 'vitest';
import { R, add, sub, mul, div, eq, fromDecimalString, toDecimalString, texFrac, isFiniteDecimal } from './rational';

describe('frações exatas', () => {
  it('simplifica e normaliza o sinal', () => {
    expect(R(6, 8)).toEqual({ n: 3, d: 4 });
    expect(R(3, -6)).toEqual({ n: -1, d: 2 });
    expect(R(0, 5)).toEqual({ n: 0, d: 1 });
    expect(() => R(1, 0)).toThrow();
  });

  it('faz as quatro operações sem erro de arredondamento', () => {
    expect(add(R(1, 10), R(2, 10))).toEqual(R(3, 10));
    expect(sub(R(1, 2), R(1, 3))).toEqual(R(1, 6));
    expect(mul(R(2, 3), R(9, 4))).toEqual(R(3, 2));
    expect(div(R(3, 4), R(3, 8))).toEqual(R(2));
    expect(eq(R(2, 4), R(1, 2))).toBe(true);
  });

  it('converte decimais nos dois sentidos', () => {
    expect(fromDecimalString('1.15')).toEqual(R(23, 20));
    expect(fromDecimalString('-0.05')).toEqual(R(-1, 20));
    expect(toDecimalString(R(23, 20))).toBe('1,15');
    expect(toDecimalString(R(-1, 8))).toBe('-0,125');
    expect(toDecimalString(R(7))).toBe('7');
    expect(toDecimalString(R(1, 3))).toBeNull();
    expect(isFiniteDecimal(R(3, 40))).toBe(true);
  });

  it('gera LaTeX de frações', () => {
    expect(texFrac(R(-3, 4))).toBe('-\\frac{3}{4}');
    expect(texFrac(R(5))).toBe('5');
  });
});
