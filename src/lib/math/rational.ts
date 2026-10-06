// Aritmética exata com frações (numerador/denominador inteiros).
// Usada pelos geradores e pela correção de respostas, para nunca depender
// de arredondamento de ponto flutuante.

export type Rational = { readonly n: number; readonly d: number };

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

/** Cria uma fração já simplificada, com o sinal no numerador. */
export function R(n: number, d = 1): Rational {
  if (d === 0) throw new Error('denominador zero');
  if (!Number.isInteger(n) || !Number.isInteger(d)) throw new Error(`não inteiro: ${n}/${d}`);
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d) || 1;
  return { n: n / g + 0, d: d / g };
}

export const add = (a: Rational, b: Rational) => R(a.n * b.d + b.n * a.d, a.d * b.d);
export const sub = (a: Rational, b: Rational) => R(a.n * b.d - b.n * a.d, a.d * b.d);
export const mul = (a: Rational, b: Rational) => R(a.n * b.n, a.d * b.d);
export const div = (a: Rational, b: Rational) => R(a.n * b.d, a.d * b.n);
export const eq = (a: Rational, b: Rational) => a.n === b.n && a.d === b.d;
export const toNumber = (a: Rational) => a.n / a.d;
export const isInt = (a: Rational) => a.d === 1;

/** Converte um decimal finito escrito com ponto ("1.15", "-0.5") em fração exata. */
export function fromDecimalString(s: string): Rational {
  if (!/^[+-]?\d*\.?\d+$/.test(s)) throw new Error(`decimal inválido: ${s}`);
  const neg = s.startsWith('-');
  const [i, f = ''] = s.replace(/^[+-]/, '').split('.');
  const d = 10 ** f.length;
  return R((neg ? -1 : 1) * (parseInt(i || '0', 10) * d + (f ? parseInt(f, 10) : 0)), d);
}

/** Uma fração tem representação decimal finita se o denominador só tem fatores 2 e 5. */
export function isFiniteDecimal(a: Rational): boolean {
  let d = a.d;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  return d === 1;
}

/** Representação decimal exata (com vírgula por padrão), ou null se for dízima. */
export function toDecimalString(a: Rational, sep = ','): string | null {
  if (!isFiniteDecimal(a)) return null;
  let p2 = 0;
  let p5 = 0;
  let d = a.d;
  while (d % 2 === 0) {
    d /= 2;
    p2++;
  }
  while (d % 5 === 0) {
    d /= 5;
    p5++;
  }
  const places = Math.max(p2, p5);
  const scaled = Math.abs(a.n) * (10 ** places / a.d);
  const digits = String(Math.round(scaled)).padStart(places + 1, '0');
  const intPart = places ? digits.slice(0, -places) : digits;
  const frac = places ? digits.slice(-places) : '';
  return (a.n < 0 ? '-' : '') + intPart + (frac ? sep + frac : '');
}

/** LaTeX de uma fração (sinal fora da barra). */
export function texFrac(a: Rational): string {
  if (a.d === 1) return String(a.n);
  return `${a.n < 0 ? '-' : ''}\\frac{${Math.abs(a.n)}}{${a.d}}`;
}
