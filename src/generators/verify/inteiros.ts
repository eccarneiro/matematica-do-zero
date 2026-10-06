import { expect } from 'vitest';
import { R, eq } from '@/lib/math/rational';
import { dataOf, expectedValue, type Verifiers } from './helpers';

export const inteiros: Verifiers = {
  sum(q) {
    const { signed, result } = dataOf<{ signed: number[]; result: number }>(q);
    expect(signed.reduce((s, x) => s + x, 0)).toBe(result);
    expect(eq(expectedValue(q), R(result))).toBe(true);
  },
  mul(q) {
    const { x, y, result } = dataOf<{ x: number; y: number; result: number }>(q);
    expect(x * y).toBe(result);
    expect(eq(expectedValue(q), R(result))).toBe(true);
  },
  div(q) {
    const { x, y, result } = dataOf<{ x: number; y: number; result: number }>(q);
    expect(y).not.toBe(0);
    expect(x / y).toBe(result);
    expect(Number.isInteger(result)).toBe(true);
    expect(eq(expectedValue(q), R(result))).toBe(true);
  },
  max(q) {
    const { values, result } = dataOf<{ values: number[]; result: number }>(q);
    expect(Math.max(...values)).toBe(result);
    const a = q.answer;
    if (a.type !== 'choice') throw new Error('esperava múltipla escolha');
    expect(a.options[a.correct]).toContain(String(result));
  },
};
