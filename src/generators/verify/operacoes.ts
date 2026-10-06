import { expect } from 'vitest';
import { R, eq } from '@/lib/math/rational';
import { dataOf, expectedValue, type Verifiers } from './helpers';

/**
 * Avaliador independente (descida recursiva) de expressões com + − × ÷ e
 * parênteses, como "18 + 6 * (7 - 4) / 2". Exige divisões exatas.
 */
function evaluate(expr: string): number {
  const toks = expr.match(/\d+|[-+*/()]/g) ?? [];
  let pos = 0;
  const peek = () => toks[pos];
  function factor(): number {
    const t = toks[pos++];
    if (t === '(') {
      const v = sum();
      expect(toks[pos++]).toBe(')');
      return v;
    }
    expect(t).toMatch(/^\d+$/);
    return Number(t);
  }
  function product(): number {
    let v = factor();
    while (peek() === '*' || peek() === '/') {
      const op = toks[pos++];
      const b = factor();
      if (op === '/') {
        expect(b).not.toBe(0);
        expect(v % b, `divisão exata em "${expr}"`).toBe(0);
        v = v / b;
      } else v = v * b;
    }
    return v;
  }
  function sum(): number {
    let v = product();
    while (peek() === '+' || peek() === '-') {
      const op = toks[pos++];
      const b = product();
      v = op === '+' ? v + b : v - b;
      expect(v, `resultado parcial negativo em "${expr}"`).toBeGreaterThanOrEqual(0);
    }
    return v;
  }
  const v = sum();
  expect(pos).toBe(toks.length);
  return v;
}

const checkValue = (q: Parameters<Verifiers[string]>[0], v: number) => expect(eq(expectedValue(q), R(v))).toBe(true);

export const operacoes: Verifiers = {
  'op-soma'(q) {
    const { a, b, result } = dataOf<{ a: number; b: number; result: number }>(q);
    expect(a + b).toBe(result);
    checkValue(q, result);
  },
  'op-sub'(q) {
    const { a, b, result } = dataOf<{ a: number; b: number; result: number }>(q);
    expect(a - b).toBe(result);
    expect(result).toBeGreaterThan(0);
    checkValue(q, result);
  },
  'op-mul'(q) {
    const { a, b, result } = dataOf<{ a: number; b: number; result: number }>(q);
    expect(a * b).toBe(result);
    checkValue(q, result);
  },
  'op-div'(q) {
    const { n, d, result } = dataOf<{ n: number; d: number; result: number }>(q);
    expect(n % d).toBe(0);
    expect(n / d).toBe(result);
    checkValue(q, result);
  },
  'op-resto'(q) {
    const { n, d, q: quo, r } = dataOf<{ n: number; d: number; q: number; r: number }>(q);
    expect(Math.floor(n / d)).toBe(quo);
    expect(n % d).toBe(r);
    const a = q.answer;
    if (a.type !== 'fields') throw new Error('esperava campos');
    expect(eq(a.fields[0].value, R(quo))).toBe(true);
    expect(eq(a.fields[1].value, R(r))).toBe(true);
  },
  'op-lacuna'(q) {
    const { op, known, total, result } = dataOf<{ op: '+' | 'x'; known: number; total: number; result: number }>(q);
    expect(op === '+' ? result + known : result * known).toBe(total);
    checkValue(q, result);
  },
  'op-expr'(q) {
    const { expr, result } = dataOf<{ expr: string; result: number }>(q);
    expect(evaluate(expr)).toBe(result);
    checkValue(q, result);
  },
  'op-ordem'(q) {
    const { expr, result } = dataOf<{ expr: string; result: number }>(q);
    expect(evaluate(expr)).toBe(result);
    const a = q.answer;
    if (a.type !== 'choice') throw new Error('esperava múltipla escolha');
    expect(Number(a.options[a.correct].replace(/\D/g, ''))).toBe(result);
  },
  'op-vans'(q) {
    const { n, cap, result } = dataOf<{ n: number; cap: number; result: number }>(q);
    expect(n % cap).not.toBe(0);
    expect(Math.ceil(n / cap)).toBe(result);
    checkValue(q, result);
  },
};
