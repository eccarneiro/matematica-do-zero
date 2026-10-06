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
  'int-reta'(q) {
    const { point, result } = dataOf<{ point: number; result: number }>(q);
    expect(result).toBe(point);
    expect(q.figure).toContain('circle');
    expect(eq(expectedValue(q), R(point))).toBe(true);
  },
  'int-oposto'(q) {
    const { n, twice, result } = dataOf<{ n: number; twice: boolean; result: number }>(q);
    expect(result).toBe(twice ? -(-n) : -n);
    expect(eq(expectedValue(q), R(result))).toBe(true);
  },
  'int-modulo'(q) {
    const d = dataOf<{ a: number; b?: number; form: string; result: number }>(q);
    const expected = d.form === 'distancia' ? Math.abs(d.a - d.b!) : d.form === 'soma' ? Math.abs(d.a) + Math.abs(d.b!) : Math.abs(d.a);
    expect(d.result).toBe(expected);
    expect(d.result).toBeGreaterThanOrEqual(0);
    expect(eq(expectedValue(q), R(expected))).toBe(true);
  },
  max(q) {
    const { values, result } = dataOf<{ values: number[]; result: number }>(q);
    expect(Math.max(...values)).toBe(result);
    const a = q.answer;
    if (a.type !== 'choice') throw new Error('esperava múltipla escolha');
    expect(a.options[a.correct]).toContain(String(result));
  },
};
