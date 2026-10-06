import { expect } from 'vitest';
import { R, add, sub, mul, div, eq, gcd, type Rational } from '@/lib/math/rational';
import { dataOf, expectedValue, type Verifiers } from './helpers';
import type { Question } from '../types';

type Pair = [number, number];
const rat = ([n, d]: Pair) => R(n, d);

/** A resposta é a fração esperada e o corretor exige a forma simplificada. */
function expectFrac(q: Question, value: Rational) {
  expect(eq(expectedValue(q), value)).toBe(true);
  expect(q.answer.type === 'number' && q.answer.requireSimplified).toBe(true);
}

const count = (svg: string, re: RegExp) => (svg.match(re) ?? []).length;

export const fracoes: Verifiers = {
  'frac-figura'(q) {
    const { n, k } = dataOf<{ n: number; k: number }>(q);
    expect(k).toBeGreaterThan(0);
    expect(k).toBeLessThan(n);
    expect(eq(expectedValue(q), R(k, n))).toBe(true);
    // A figura tem n partes, k delas pintadas.
    const svg = q.figure ?? '';
    expect(count(svg, /data-part="1"/g)).toBe(n);
    expect(count(svg, /data-painted="1"/g)).toBe(k);
  },
  'frac-quantidade'(q) {
    const { n, d, total, result } = dataOf<{ n: number; d: number; total: number; result: number }>(q);
    const v = mul(R(n, d), R(total));
    expect(v.d).toBe(1);
    expect(v.n).toBe(result);
    expect(eq(expectedValue(q), R(result))).toBe(true);
  },
  'frac-simplificar'(q) {
    const { n, d } = dataOf<{ n: number; d: number }>(q);
    expect(gcd(n, d)).toBeGreaterThan(1);
    expectFrac(q, R(n, d));
    const v = expectedValue(q);
    expect(gcd(v.n, v.d)).toBe(1);
  },
  'frac-soma'(q) {
    const { a, b, op } = dataOf<{ a: Pair; b: Pair; op: '+' | '-' }>(q);
    const v = op === '+' ? add(rat(a), rat(b)) : sub(rat(a), rat(b));
    expect(v.n).toBeGreaterThan(0);
    expectFrac(q, v);
  },
  'frac-equivalente'(q) {
    const { n, d, n2, d2, result, missing } = dataOf<{ n: number; d: number; n2: number; d2: number; result: number; missing: 'num' | 'den' }>(q);
    expect(n * d2).toBe(n2 * d);
    expect(missing === 'num' ? n2 : d2).toBe(result);
    expect(eq(expectedValue(q), R(result))).toBe(true);
  },
  'frac-misto'(q) {
    const { w, n, d, result } = dataOf<{ w: number; n: number; d: number; result: number }>(q);
    expect(eq(add(R(w), R(n, d)), R(result, d))).toBe(true);
    expect(eq(expectedValue(q), R(result))).toBe(true);
  },
  'frac-comparar'(q) {
    const { a, b, result } = dataOf<{ a: Pair; b: Pair; result: Pair }>(q);
    const [x, y] = [rat(a), rat(b)];
    const big = x.n * y.d > y.n * x.d ? x : y;
    expect(eq(big, rat(result))).toBe(true);
    const ans = q.answer;
    if (ans.type !== 'choice') throw new Error('esperava múltipla escolha');
    expect(ans.options[ans.correct]).toContain(`\\frac{${big.n}}{${big.d}}`);
  },
  'frac-mul'(q) {
    const { a, b } = dataOf<{ a: Pair; b: Pair }>(q);
    expectFrac(q, mul(rat(a), rat(b)));
  },
  'frac-div'(q) {
    const { a, b } = dataOf<{ a: Pair; b: Pair }>(q);
    expectFrac(q, div(rat(a), rat(b)));
  },
  'frac-expressao'(q) {
    const { a, b, c, op } = dataOf<{ a: Pair; b: Pair; c: Pair; op: '+' | '-' }>(q);
    const p = mul(rat(b), rat(c));
    const v = op === '+' ? add(rat(a), p) : sub(rat(a), p);
    expect(v.n).toBeGreaterThan(0);
    expectFrac(q, v);
  },
  'frac-sobra'(q) {
    const { a, b } = dataOf<{ a: Pair; b: Pair }>(q);
    const v = sub(R(1), add(rat(a), rat(b)));
    expect(v.n).toBeGreaterThan(0);
    expectFrac(q, v);
  },
  'frac-receita'(q) {
    const { a, b } = dataOf<{ a: Pair; b: Pair }>(q);
    expectFrac(q, mul(rat(a), rat(b)));
  },
  'frac-percurso'(q) {
    const { a, b, total, result } = dataOf<{ a: Pair; b: Pair; total: number; result: number }>(q);
    const left = mul(sub(R(1), add(rat(a), rat(b))), R(total));
    expect(left.d).toBe(1);
    // Cada trecho também é um número inteiro de km.
    expect(mul(rat(a), R(total)).d).toBe(1);
    expect(mul(rat(b), R(total)).d).toBe(1);
    expect(left.n).toBe(result);
    expect(result).toBeGreaterThan(0);
    expect(eq(expectedValue(q), R(result))).toBe(true);
  },
  'frac-copos'(q) {
    const { a, b, result } = dataOf<{ a: Pair; b: Pair; result: number }>(q);
    const v = div(rat(a), rat(b));
    expect(v.d).toBe(1);
    expect(v.n).toBe(result);
    expect(eq(expectedValue(q), R(result))).toBe(true);
  },
};
