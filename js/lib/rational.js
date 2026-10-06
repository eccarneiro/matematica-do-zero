// Aritmética exata com frações (numerador/denominador inteiros).
// Usada pelos geradores e pela correção de respostas, para nunca depender
// de arredondamento de ponto flutuante.

export function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

export function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

export function R(n, d = 1) {
  if (d === 0) throw new Error('denominador zero');
  if (!Number.isInteger(n) || !Number.isInteger(d)) throw new Error(`não inteiro: ${n}/${d}`);
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d) || 1;
  return { n: n / g, d: d / g };
}

export const add = (a, b) => R(a.n * b.d + b.n * a.d, a.d * b.d);
export const sub = (a, b) => R(a.n * b.d - b.n * a.d, a.d * b.d);
export const mul = (a, b) => R(a.n * b.n, a.d * b.d);
export const div = (a, b) => R(a.n * b.d, a.d * b.n);
export const eq = (a, b) => a.n === b.n && a.d === b.d;
export const toNumber = (a) => a.n / a.d;
export const isInt = (a) => a.d === 1;

// Converte um decimal finito (ex.: 1.15) em fração exata.
export function fromDecimal(x) {
  const s = String(x);
  if (/e/i.test(s)) throw new Error('notação exponencial não suportada');
  const [i, f = ''] = s.split('.');
  const d = 10 ** f.length;
  const sign = s.startsWith('-') ? -1 : 1;
  return R(sign * (Math.abs(parseInt(i || '0', 10)) * d + (f ? parseInt(f, 10) : 0)), d);
}

// Uma fração tem representação decimal finita se o denominador só tem fatores 2 e 5.
export function isFiniteDecimal(a) {
  let d = a.d;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  return d === 1;
}

// Representação decimal exata (string com vírgula), apenas para decimais finitos.
export function toDecimalString(a, sep = ',') {
  if (!isFiniteDecimal(a)) return null;
  // Casas decimais necessárias = max(expoente de 2, expoente de 5) no denominador.
  let p2 = 0, p5 = 0, d = a.d;
  while (d % 2 === 0) { d /= 2; p2++; }
  while (d % 5 === 0) { d /= 5; p5++; }
  const places = Math.max(p2, p5);
  const scaled = Math.abs(a.n) * (10 ** places / a.d);
  const digits = String(Math.round(scaled)).padStart(places + 1, '0');
  const intPart = places ? digits.slice(0, -places) : digits;
  const frac = places ? digits.slice(-places) : '';
  const sign = a.n < 0 ? '-' : '';
  return sign + intPart + (frac ? sep + frac : '');
}

// LaTeX de uma fração (com sinal fora).
export function texFrac(a) {
  if (a.d === 1) return String(a.n);
  const sign = a.n < 0 ? '-' : '';
  return `${sign}\\frac{${Math.abs(a.n)}}{${a.d}}`;
}

// LaTeX de um número decimal no padrão brasileiro (vírgula sem espaço extra).
export function texDec(x) {
  const a = typeof x === 'number' ? fromDecimal(x) : x;
  const s = toDecimalString(a, ',');
  return s.replace(',', '{,}');
}
