import { expect } from 'vitest';
import { R, eq, mul, type Rational } from '@/lib/math/rational';
import { dataOf, expectedValue, type Verifiers } from './helpers';

/** Potência exata com BigInt (não depende do limite do Number). */
const big = (b: number, e: number) => BigInt(b) ** BigInt(e);

const qpow = (a: Rational, e: number): Rational => {
  let r = R(1);
  for (let i = 0; i < Math.abs(e); i++) r = mul(r, a);
  return e < 0 ? R(r.d, r.n) : r;
};

function checkInt(q: Parameters<Verifiers[string]>[0], result: number) {
  expect(Number.isSafeInteger(result)).toBe(true);
  expect(eq(expectedValue(q), R(result))).toBe(true);
}

export const potencias: Verifiers = {
  'pot-pow'(q) {
    const { base, exp, result } = dataOf<{ base: number; exp: number; result: number }>(q);
    expect(exp).toBeGreaterThanOrEqual(0);
    expect(base).not.toBe(0);
    expect(big(base, exp)).toBe(BigInt(result));
    expect(Math.pow(base, exp)).toBe(result);
    checkInt(q, result);
  },
  'pot-root'(q) {
    const { radicand, index, result } = dataOf<{ radicand: number; index: number; result: number }>(q);
    expect(big(result, index)).toBe(BigInt(radicand));
    // raiz quadrada é sempre a positiva
    if (index % 2 === 0) expect(result).toBeGreaterThan(0);
    checkInt(q, result);
  },
  'pot-sign'(q) {
    const { a, exp, paren, result } = dataOf<{ a: number; exp: number; paren: boolean; result: number }>(q);
    expect(a).toBeGreaterThan(0);
    expect(result).toBe(paren ? Math.pow(-a, exp) : -Math.pow(a, exp));
    expect(q.prompt).toContain(paren ? `(-${a})^{${exp}}` : `-${a}^{${exp}}`);
    checkInt(q, result);
  },
  'pot-neg'(q) {
    const { num, den, n } = dataOf<{ num: number; den: number; n: number }>(q);
    expect(n).toBeGreaterThan(0);
    const value = qpow(R(num, den), -n);
    expect(eq(expectedValue(q), value)).toBe(true);
    expect(q.answer.type === 'number' && q.answer.requireSimplified).toBe(true);
  },
  'pot-prop'(q) {
    const { form, exps, result, base } = dataOf<{ form: string; exps: number[]; result: number; base: number | null }>(q);
    const [x, y, z] = exps;
    const expected = form === 'mul' ? x + y : form === 'div' ? x - y : form === 'pow' ? x * y : x + y - z;
    expect(result).toBe(expected);
    expect(result).toBeGreaterThan(0);
    // conferência numérica exata com a base concreta
    if (base !== null) {
      const b = BigInt(base);
      const lhs =
        form === 'mul' ? b ** BigInt(x) * b ** BigInt(y)
        : form === 'div' ? b ** BigInt(x) / b ** BigInt(y)
        : form === 'pow' ? (b ** BigInt(x)) ** BigInt(y)
        : (b ** BigInt(x) * b ** BigInt(y)) / b ** BigInt(z);
      expect(lhs).toBe(b ** BigInt(result));
    }
    checkInt(q, result);
  },
  'pot-sci'(q) {
    const { value, mant, exp } = dataOf<{ value: [number, number]; mant: [number, number]; exp: number }>(q);
    const v = R(value[0], value[1]);
    const mt = R(mant[0], mant[1]);
    // 1 ≤ mantissa < 10
    expect(mt.n >= mt.d && mt.n < 10 * mt.d).toBe(true);
    expect(eq(mul(mt, qpow(R(10), exp)), v)).toBe(true);
    checkInt(q, exp);
  },
  'pot-rad'(q) {
    const { radicand, coef, rad } = dataOf<{ radicand: number; coef: number; rad: number }>(q);
    expect(coef * coef * rad).toBe(radicand);
    expect(rad).toBeGreaterThan(1);
    // sem fator quadrado restante: coef é o maior possível
    for (let k = 2; k * k <= rad; k++) expect(rad % (k * k)).not.toBe(0);
    let best = 1;
    for (let k = 1; k * k <= radicand; k++) if (radicand % (k * k) === 0) best = k;
    expect(best).toBe(coef);
    const a = q.answer;
    if (a.type !== 'radical') throw new Error('esperava resposta com radical');
    expect([a.coef, a.rad]).toEqual([coef, rad]);
  },
  'pot-expr'(q) {
    type T = { sign: number; type: 'pow' | 'root'; base?: number; exp?: number; radicand?: number; index?: number };
    const { terms, result } = dataOf<{ terms: T[]; result: number }>(q);
    let sum = 0;
    for (const t of terms) {
      let v: number;
      if (t.type === 'pow') v = Math.pow(t.base!, t.exp!);
      else {
        // procura a raiz inteira por força bruta
        const idx = t.index!;
        const found = Array.from({ length: 101 }, (_, i) => i - 50).find((r) => Math.pow(r, idx) === t.radicand && (idx % 2 === 1 || r >= 0));
        expect(found).toBeDefined();
        v = found!;
      }
      sum += t.sign * v;
    }
    expect(sum).toBe(result);
    checkInt(q, result);
  },
  'pot-between'(q) {
    const { n, lo, hi } = dataOf<{ n: number; lo: number; hi: number }>(q);
    expect(hi).toBe(lo + 1);
    expect(lo * lo < n && n < hi * hi).toBe(true);
    const a = q.answer;
    if (a.type !== 'fields') throw new Error('esperava dois campos');
    expect(eq(a.fields[0].value, R(lo)) && eq(a.fields[1].value, R(hi))).toBe(true);
  },
};
