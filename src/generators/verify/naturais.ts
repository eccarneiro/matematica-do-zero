import { expect } from 'vitest';
import { R, eq } from '@/lib/math/rational';
import { dataOf, expectedValue, type Verifiers } from './helpers';

export const naturais: Verifiers = {
  'nat-contar'(q) {
    const { groups, rest, result } = dataOf<{ groups: number; rest: number; result: number }>(q);
    expect(groups * 5 + rest).toBe(result);
    expect(rest).toBeLessThan(5);
    // a figura tem 4 riscos + 1 corte por feixe, mais os soltos
    expect((q.figure!.match(/<line/g) ?? []).length).toBe(groups * 5 + rest);
    expect(eq(expectedValue(q), R(result))).toBe(true);
  },
  'nat-sucessor'(q) {
    const { n, prev, result } = dataOf<{ n: number; prev: boolean; result: number }>(q);
    expect(result).toBe(prev ? n - 1 : n + 1);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(eq(expectedValue(q), R(result))).toBe(true);
  },
  'nat-conjunto'(q) {
    const { value, set, result } = dataOf<{ value: string; set: 'N' | 'Nstar'; result: boolean }>(q);
    const v = Number(value.replace(',', '.'));
    const inN = Number.isInteger(v) && v >= 0;
    expect(result).toBe(set === 'N' ? inN : inN && v > 0);
    const a = q.answer;
    if (a.type !== 'choice') throw new Error('esperava múltipla escolha');
    expect(a.options[a.correct]).toBe(result ? 'Sim' : 'Não');
  },
  'nat-intervalo'(q) {
    const { a, b, result } = dataOf<{ a: number; b: number; result: number }>(q);
    expect(result).toBe(Array.from({ length: b - a + 1 }, (_, i) => a + i).length);
    expect(eq(expectedValue(q), R(result))).toBe(true);
  },
};
