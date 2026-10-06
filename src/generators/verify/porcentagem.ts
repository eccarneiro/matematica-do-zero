import { expect } from 'vitest';
import { R, add, div, eq, mul, sub, isInt, fromDecimalString, type Rational } from '@/lib/math/rational';
import { dataOf, expectedValue, type Verifiers } from './helpers';

/** Valor em dinheiro: no máximo 2 casas decimais. */
const isMoney = (v: Rational) => isInt(mul(v, R(100)));
const dec = (s: string) => fromDecimalString(s.replace(',', '.'));
/** p% de x. */
const pct = (p: number, x: Rational) => div(mul(R(p), x), R(100));

export const porcentagem: Verifiers = {
  'pct-de'(q) {
    const { p, n, result } = dataOf<{ p: number; n: number; result: Rational }>(q);
    const v = pct(p, R(n));
    expect(eq(v, result)).toBe(true);
    expect(isMoney(v)).toBe(true);
    expect(eq(expectedValue(q), v)).toBe(true);
  },
  'pct-conv'(q) {
    const { dir, p, numr, den } = dataOf<{ dir: string; p: number; numr: number; den: number }>(q);
    if (dir === 'to-dec') expect(eq(expectedValue(q), R(p, 100))).toBe(true);
    else if (dir === 'to-pct') expect(eq(expectedValue(q), R(p))).toBe(true);
    else {
      expect(numr * 100).toBe(p * den);
      expect(eq(expectedValue(q), mul(R(numr, den), R(100)))).toBe(true);
    }
  },
  'pct-var'(q) {
    const { base, p, up } = dataOf<{ base: number; p: number; up: boolean }>(q);
    const d = pct(p, R(base));
    const v = up ? add(R(base), d) : sub(R(base), d);
    expect(isMoney(v)).toBe(true);
    expect(eq(expectedValue(q), v)).toBe(true);
  },
  'pct-qual'(q) {
    const { part, whole, result } = dataOf<{ part: number; whole: number; result: number }>(q);
    const v = mul(R(part, whole), R(100));
    expect(eq(v, R(result))).toBe(true);
    expect(eq(expectedValue(q), v)).toBe(true);
  },
  'pct-taxa'(q) {
    const { from, to } = dataOf<{ from: number; to: number }>(q);
    const v = mul(div(R(to - from), R(from)), R(100));
    expect(v.n).not.toBe(0);
    expect(isInt(v)).toBe(true);
    expect(eq(expectedValue(q), v)).toBe(true);
  },
  'pct-suc'(q) {
    const { base, p1, p2 } = dataOf<{ base: number; p1: number; p2: number }>(q);
    const mid = add(R(base), pct(p1, R(base)));
    const v = add(mid, pct(p2, mid));
    expect(isMoney(v)).toBe(true);
    expect(eq(expectedValue(q), v)).toBe(true);
  },
  'pct-suc-eq'(q) {
    const { p1, p2 } = dataOf<{ p1: number; p2: number }>(q);
    // Começando de 100: o valor final menos 100 é a variação em %.
    const mid = add(R(100), pct(p1, R(100)));
    const v = sub(add(mid, pct(p2, mid)), R(100));
    expect(eq(expectedValue(q), v)).toBe(true);
  },
  'pct-orig'(q) {
    const { p, up, final, result } = dataOf<{ p: number; up: boolean; final: string; result: number }>(q);
    // O original, depois da mudança, precisa dar o valor final.
    const changed = up ? add(R(result), pct(p, R(result))) : sub(R(result), pct(p, R(result)));
    expect(eq(changed, dec(final))).toBe(true);
    expect(eq(expectedValue(q), R(result))).toBe(true);
  },
  'pct-juros'(q) {
    const { c, i, t, askTotal } = dataOf<{ c: number; i: number; t: number; askTotal: boolean }>(q);
    let juros = R(0);
    for (let k = 0; k < t; k++) juros = add(juros, pct(i, R(c)));
    const v = askTotal ? add(R(c), juros) : juros;
    expect(isMoney(v)).toBe(true);
    expect(eq(expectedValue(q), v)).toBe(true);
  },
  'pct-ofertas'(q) {
    type Offer = { price: number; pct?: number; off?: number };
    const { a, b } = dataOf<{ a: Offer; b: Offer }>(q);
    const final = (o: Offer) => (o.pct !== undefined ? sub(R(o.price), pct(o.pct, R(o.price))) : R(o.price - o.off!));
    const d = sub(final(a), final(b));
    const ans = q.answer;
    if (ans.type !== 'choice') throw new Error('esperava múltipla escolha');
    const picked = ans.options[ans.correct];
    if (d.n === 0) expect(picked).toMatch(/mesmo preço/);
    else expect(picked).toBe(d.n < 0 ? 'Loja A' : 'Loja B');
  },
};
