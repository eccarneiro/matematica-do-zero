import { expect } from 'vitest';
import { R, add, sub, mul, div, eq, fromDecimalString, isFiniteDecimal, toDecimalString, type Rational } from '@/lib/math/rational';
import { dataOf, expectedValue, type Verifiers } from './helpers';
import type { Question } from '../types';

const F = fromDecimalString;

/** A resposta é um decimal finito com no máximo `max` casas e igual a `v`. */
function expectDec(q: Question, v: Rational, max = 4) {
  expect(isFiniteDecimal(v)).toBe(true);
  expect(eq(expectedValue(q), v)).toBe(true);
  const s = toDecimalString(v)!;
  expect((s.split(',')[1] ?? '').length).toBeLessThanOrEqual(max);
}

/** Opção correta de uma múltipla escolha, conferida contra o valor esperado. */
function expectChoice(q: Question, v: Rational) {
  const a = q.answer;
  if (a.type !== 'choice') throw new Error('esperava múltipla escolha');
  expect(a.options[a.correct]).toBe(`\\(${toDecimalString(v)!.replace(',', '{,}')}\\)`);
}

const less = (a: Rational, b: Rational) => a.n * b.d < b.n * a.d;

export const decimais: Verifiers = {
  'dec-frac2dec'(q) {
    const { n, d } = dataOf<{ n: number; d: number }>(q);
    expect(n % d).not.toBe(0);
    expectDec(q, R(n, d), 2);
  },
  'dec-dec2frac'(q) {
    const { dec } = dataOf<{ dec: string }>(q);
    const v = F(dec);
    expect(v.d).toBeGreaterThan(1);
    expect(q.answer.type === 'number' && q.answer.requireSimplified).toBe(true);
    expect(q.answerText).toBe(`${v.n}/${v.d}`);
    expect(eq(expectedValue(q), v)).toBe(true);
  },
  'dec-max'(q) {
    const { values } = dataOf<{ values: string[] }>(q);
    const [a, b] = values.map(F);
    expect(eq(a, b)).toBe(false);
    expectChoice(q, less(a, b) ? b : a);
  },
  'dec-order'(q) {
    const { values, want } = dataOf<{ values: string[]; want: 'max' | 'min' }>(q);
    const vs = values.map(F);
    let best = vs[0];
    for (const v of vs) if (want === 'max' ? less(best, v) : less(v, best)) best = v;
    expect(vs.filter((v) => eq(v, best))).toHaveLength(1);
    expectChoice(q, best);
  },
  'dec-addsub'(q) {
    const { a, b, op } = dataOf<{ a: string; b: string; op: '+' | '-' }>(q);
    const v = op === '+' ? add(F(a), F(b)) : sub(F(a), F(b));
    expect(v.n).toBeGreaterThanOrEqual(0);
    expectDec(q, v, 3);
  },
  'dec-mul'(q) {
    const { a, b } = dataOf<{ a: string; b: string }>(q);
    expectDec(q, mul(F(a), F(b)), 3);
  },
  'dec-div'(q) {
    const { a, b } = dataOf<{ a: string; b: string }>(q);
    const v = div(F(a), F(b));
    expectDec(q, v, 3);
    expect(eq(mul(v, F(b)), F(a))).toBe(true);
  },
  'dec-pow10'(q) {
    const { a, f, op } = dataOf<{ a: string; f: number; op: 'mul' | 'div' }>(q);
    expect([10, 100, 1000]).toContain(f);
    expectDec(q, op === 'mul' ? mul(F(a), R(f)) : div(F(a), R(f)), 4);
  },
  'dec-troco'(q) {
    const { items, note } = dataOf<{ items: [number, number][]; note: number }>(q);
    const total = items.reduce((s, [qty, cents]) => add(s, mul(R(qty), R(cents, 100))), R(0));
    const v = sub(R(note), total);
    expect(v.n).toBeGreaterThan(0);
    expectDec(q, v, 2);
  },
  'dec-kg'(q) {
    const { price, weight } = dataOf<{ price: number; weight: string }>(q);
    expectDec(q, mul(R(price, 100), F(weight)), 2);
  },
  'dec-split'(q) {
    const { total, n } = dataOf<{ total: number; n: number }>(q);
    expectDec(q, div(R(total, 100), R(n)), 2);
  },
};
