// Utilidades comuns aos geradores de questões.

import type { ExpectedAnswer } from '@/lib/math/answer';
import type { Rng } from '@/lib/math/random';
import { R, texFrac, toDecimalString, type Rational } from '@/lib/math/rational';

/** Fórmula na linha. */
export const m = (tex: string) => `\\(${tex}\\)`;
/** Fórmula em destaque. */
export const M = (tex: string) => `\\[${tex}\\]`;

const thousands = (n: number, sep: string) => Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);

/** Inteiro em LaTeX com separador de milhar brasileiro. */
export const tn = (n: number) => (n < 0 ? '-' : '') + thousands(n, '{.}');
/** Inteiro em texto puro. */
export const pn = (n: number) => (n < 0 ? '-' : '') + thousands(n, '.');
/** Inteiro em LaTeX, entre parênteses quando negativo. */
export const par = (n: number) => (n < 0 ? `(${tn(n)})` : tn(n));

/** Racional em LaTeX: decimal (quando finito e preferido) ou fração. */
export function tr(a: Rational, prefer: 'frac' | 'dec' = 'frac'): string {
  if (a.d === 1) return tn(a.n);
  if (prefer === 'dec') {
    const s = toDecimalString(a);
    if (s) return s.replace(',', '{,}');
  }
  return texFrac(a);
}

/** Decimal finito em LaTeX. */
export function td(a: Rational): string {
  const s = toDecimalString(a);
  if (s === null) throw new Error(`não é decimal finito: ${a.n}/${a.d}`);
  return s.replace(',', '{,}');
}

/** Decimal finito em texto puro. */
export function pd(a: Rational): string {
  const s = toDecimalString(a);
  if (s === null) throw new Error(`não é decimal finito: ${a.n}/${a.d}`);
  return s;
}

export const intAnswer = (n: number): ExpectedAnswer => ({ type: 'number', value: R(n) });

/** Múltipla escolha com as opções embaralhadas. */
export function choice(rng: Rng, correct: string, wrong: string[]): Extract<ExpectedAnswer, { type: 'choice' }> {
  const options = rng.shuffle([correct, ...wrong]);
  return { type: 'choice', options, correct: options.indexOf(correct) };
}
