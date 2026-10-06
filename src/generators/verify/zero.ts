import { expect } from 'vitest';
import { R, eq } from '@/lib/math/rational';
import type { Question } from '../types';
import { dataOf, expectedValue, type Verifiers } from './helpers';

/** Opção correta de uma questão de múltipla escolha. */
function correctOption(q: Question): string {
  const a = q.answer;
  if (a.type !== 'choice') throw new Error('esperava múltipla escolha');
  return a.options[a.correct];
}

/** Lê um número escrito em LaTeX com separador de milhar ("3{.}045"). */
const readTex = (s: string) => Number(s.replace(/\\\(|\\\)|\{\.\}|\s/g, ''));

const expectInt = (q: Question, v: number) => expect(eq(expectedValue(q), R(v))).toBe(true);

export const zero: Verifiers = {
  'zero-digit-value'(q) {
    const { n, pos, result } = dataOf<{ n: number; pos: number; result: number }>(q);
    const s = String(n);
    const d = Number(s[s.length - 1 - pos]);
    expect(d).toBeGreaterThan(0);
    expect(d * Math.pow(10, pos)).toBe(result);
    expectInt(q, result);
  },
  'zero-compose'(q) {
    const { digits, result } = dataOf<{ digits: [number, number][]; result: number }>(q);
    expect(digits.reduce((s, [k, d]) => s + d * Math.pow(10, k), 0)).toBe(result);
    // tem alguma casa vazia
    expect(String(result)).toContain('0');
    expectInt(q, result);
  },
  'zero-op'(q) {
    const { x, op, y, result } = dataOf<{ x: number; op: string; y: number; result: number }>(q);
    expect(x === 0 || y === 0 || (op === '-' && x === y)).toBe(true);
    if (op === '/') expect(y).not.toBe(0);
    const r = op === '+' ? x + y : op === '-' ? x - y : op === '*' ? x * y : x / y;
    expect(r).toBe(result);
    expectInt(q, result);
  },
  'zero-expanded'(q) {
    const { parts, result } = dataOf<{ parts: number[]; result: number }>(q);
    expect(parts.reduce((s, v) => s + v, 0)).toBe(result);
    expectInt(q, result);
  },
  'zero-to-expanded'(q) {
    const { n } = dataOf<{ n: number }>(q);
    const parts = correctOption(q).replace(/\\\(|\\\)/g, '').split('+').map(readTex);
    expect(parts.reduce((s, v) => s + v, 0)).toBe(n);
    // cada parcela é um único algarismo seguido de zeros
    for (const p of parts) expect(String(p)).toMatch(/^[1-9]0*$/);
  },
  'zero-compare'(q) {
    const { values, big, result } = dataOf<{ values: number[]; big: boolean; result: number }>(q);
    expect(big ? Math.max(...values) : Math.min(...values)).toBe(result);
    expect(readTex(correctOption(q))).toBe(result);
  },
  'zero-div'(q) {
    const { x, y } = dataOf<{ x: number; y: number }>(q);
    const opt = correctOption(q);
    if (y === 0) expect(opt).toMatch(/não existe/i);
    else expect(readTex(opt)).toBe(x / y);
  },
  'zero-expr'(q) {
    const { terms, signs, result } = dataOf<{
      terms: { x: number; op?: '*' | '/'; y?: number }[];
      signs: string[];
      result: number;
    }>(q);
    let total = 0;
    terms.forEach((t, i) => {
      let v = t.x;
      if (t.op === '*') v = t.x * t.y!;
      if (t.op === '/') {
        expect(t.y).not.toBe(0);
        expect(t.x % t.y!).toBe(0);
        v = t.x / t.y!;
      }
      total += signs[i] === '-' ? -v : v;
    });
    expect(terms.some((t) => t.x === 0 || t.y === 0)).toBe(true);
    expect(total).toBe(result);
    expect(result).toBeGreaterThanOrEqual(0);
    expectInt(q, result);
  },
  'zero-groups'(q) {
    const { n, size, result } = dataOf<{ n: number; size: number; result: number }>(q);
    expect(result * size).toBeLessThanOrEqual(n);
    expect((result + 1) * size).toBeGreaterThan(n);
    expectInt(q, result);
  },
  'zero-append'(q) {
    const { n, k, mode, result } = dataOf<{ n: number; k: number; mode: string; result?: number }>(q);
    const after = Number(String(n) + '0'.repeat(k));
    if (mode === 'choice') {
      const opt = correctOption(q);
      expect(opt.replace(/\{\.\}/g, '')).toContain(String(after));
      expect(opt).toContain('10 vezes maior');
    } else {
      expect(after - n).toBe(result);
      expectInt(q, result!);
    }
  },
};
