// Números decimais: frações decimais, comparação, as quatro operações e dinheiro.
// Um decimal é guardado como inteiro "sem vírgula" + número de casas (ex.: 3,25 → 325 e 2),
// e toda resposta é calculada com frações exatas.

import { R, add, sub, mul, div, gcd, type Rational } from '@/lib/math/rational';
import type { Rng } from '@/lib/math/random';
import type { Generator, Question } from './types';
import { m, M, td, pd, tn, pn, choice } from './_util';

type Dec = { i: number; p: number };

const val = (x: Dec) => R(x.i, 10 ** x.p);

/** Decimal com exatamente p casas (mantém zeros à direita): fx(540, 2) = "5,40". */
function fx(i: number, p: number, sep = ','): string {
  const s = String(Math.abs(i)).padStart(p + 1, '0');
  return (i < 0 ? '-' : '') + (p ? s.slice(0, -p) + sep + s.slice(-p) : s);
}
const tx = (x: Dec) => fx(x.i, x.p).replace(',', '{,}');
/** Texto com ponto, guardado em data para o verificador. */
const raw = (x: Dec) => fx(x.i, x.p, '.');

const money = (cents: number) => `\\text{R\\$}\\,${fx(cents, 2).replace(',', '{,}')}`;
const casas = (n: number) => (n === 1 ? '1 casa decimal' : `${n} casas decimais`);
const pt = (f: number) => (f === 1000 ? '1.000' : String(f));
const ORDINAL = ['', 'uma casa', 'duas casas', 'três casas'];

/** Sorteia um decimal com exatamente p casas (último algarismo diferente de zero) e parte inteira até maxInt. */
function randDec(rng: Rng, p: number, maxInt: number): Dec {
  let i: number;
  do i = rng.int(1, (maxInt + 1) * 10 ** p - 1);
  while (p > 0 && i % 10 === 0);
  return { i, p };
}

/** Resposta numérica padrão de um racional finito. */
function numAnswer(v: Rational) {
  return { answer: { type: 'number' as const, value: v }, answerText: pd(v), answerDisplay: m(td(v)), keys: [','] as Question['keys'] };
}

// ---------- Fração ↔ decimal ----------

function fracToDec(rng: Rng, dens: number[]): Question {
  const d = rng.pick(dens);
  let n: number;
  do n = rng.int(1, d === 100 ? 199 : d === 10 ? 29 : d * 3);
  while (n % d === 0 || (d !== 10 && d !== 100 && gcd(n, d) !== 1));
  const v = R(n, d);
  const frac = `\\frac{${n}}{${d}}`;
  const steps: string[] = [];
  if (d === 10 || d === 100) {
    const nome = d === 10 ? 'décimos' : 'centésimos';
    steps.push(`${m(frac)} são ${n} ${nome}. Dividir por ${d} é andar com a vírgula ${d === 10 ? 'uma casa' : 'duas casas'} para a esquerda.`);
  } else {
    const T = 10 % d === 0 ? 10 : 100;
    const k = T / d;
    steps.push(`O denominador ${d} não é 10 nem 100, mas ${m(`${d} \\cdot ${k} = ${T}`)}. Multiplique em cima e embaixo por ${k}: ${m(`${frac} = \\frac{${n * k}}{${T}}`)}.`);
    steps.push(`${m(`\\frac{${n * k}}{${T}}`)} são ${n * k} ${T === 10 ? 'décimos' : 'centésimos'}.`);
  }
  steps.push(`Resultado: ${m(`${frac} = ${td(v)}`)}.`);
  return {
    prompt: `Escreva a fração como número decimal: ${M(frac)}`,
    ...numAnswer(v),
    hint: `Procure uma fração equivalente com denominador 10 ou 100. Depois, é só ler: ${m('\\frac{7}{10} = 0{,}7')} e ${m('\\frac{7}{100} = 0{,}07')}.`,
    steps,
    data: { kind: 'dec-frac2dec', n, d },
  };
}

function decToFrac(rng: Rng, maxInt: number): Question {
  const x = randDec(rng, rng.pick([1, 2, 2]), maxInt);
  const T = 10 ** x.p;
  const v = val(x);
  const g = gcd(x.i, T);
  const steps = [`${m(tx(x))} tem ${casas(x.p)}, então é ${m(`\\frac{${x.i}}{${T}}`)} (${x.i} ${x.p === 1 ? 'décimos' : 'centésimos'}).`];
  if (g > 1) steps.push(`Simplifique dividindo em cima e embaixo por ${g}: ${m(`\\frac{${x.i}}{${T}} = \\frac{${v.n}}{${v.d}}`)}.`);
  else steps.push(`${x.i} e ${T} não têm divisor comum além de 1, então a fração já é irredutível.`);
  return {
    prompt: `Escreva ${m(tx(x))} como fração irredutível.`,
    answer: { type: 'number', value: v, requireSimplified: true },
    answerText: `${v.n}/${v.d}`,
    answerDisplay: m(`\\frac{${v.n}}{${v.d}}`),
    hint: `Uma casa depois da vírgula são décimos (denominador 10); duas casas são centésimos (denominador 100). Depois, simplifique.`,
    steps,
    keys: ['/'],
    placeholder: 'ex.: 3/4',
    data: { kind: 'dec-dec2frac', dec: raw(x) },
  };
}

// ---------- Comparar e ordenar ----------

const cmp = (a: Rational, b: Rational) => a.n * b.d - b.n * a.d;

function compareTwo(rng: Rng): Question {
  const ip = rng.int(0, 3);
  let a: Dec, b: Dec;
  do {
    a = { i: ip * 10 + rng.int(1, 9), p: 1 };
    b = randDec(rng, 2, 0);
    b = { i: ip * 100 + b.i, p: 2 };
  } while (a.i * 10 === b.i);
  const [big, small] = cmp(val(a), val(b)) > 0 ? [a, b] : [b, a];
  const a2 = fx(a.i * 10, 2).replace(',', '{,}');
  return {
    prompt: 'Qual destes números é <b>maior</b>?',
    answer: choice(rng, m(tx(big)), [m(tx(small))]),
    answerDisplay: m(tx(big)),
    hint: 'Complete com zeros para os dois terem o mesmo número de casas depois da vírgula. Depois compare como números inteiros.',
    steps: [
      `Acrescentar zero no fim da parte decimal não muda o número: ${m(`${tx(a)} = ${a2}`)}.`,
      `Agora compare ${m(a2)} com ${m(tx(b))}: são ${a.i * 10 - ip * 100} contra ${b.i - ip * 100} centésimos.`,
      `Logo, ${m(`${tx(big)} > ${tx(small)}`)}.`,
    ],
    data: { kind: 'dec-max', values: [raw(a), raw(b)] },
  };
}

function order(rng: Rng): Question {
  const ip = rng.int(0, 2);
  let xs: Dec[];
  do {
    xs = [1, 2, 3].map((p) => {
      const d = randDec(rng, p, 0);
      return { i: ip * 10 ** p + d.i, p };
    });
  } while (new Set(xs.map((x) => pd(val(x)))).size < 3);
  xs = rng.shuffle(xs);
  const want = rng.chance(0.5) ? 'max' : 'min';
  const sorted = xs.slice().sort((a, b) => cmp(val(a), val(b)));
  const target = want === 'max' ? sorted[2] : sorted[0];
  const padded = xs.map((x) => fx(x.i * 10 ** (3 - x.p), 3).replace(',', '{,}'));
  return {
    prompt: `Qual destes números é o <b>${want === 'max' ? 'maior' : 'menor'}</b>?`,
    answer: choice(rng, m(tx(target)), xs.filter((x) => x !== target).map((x) => m(tx(x)))),
    answerDisplay: m(tx(target)),
    hint: 'Não se deixe enganar pela quantidade de algarismos! Complete com zeros até todos terem 3 casas depois da vírgula.',
    steps: [
      `Completando com zeros até 3 casas: ${xs.map((x, k) => m(`${tx(x)} = ${padded[k]}`)).join(', ')}.`,
      `Em milésimos, a ordem fica ${m(sorted.map(tx).join(' < '))}.`,
      `O ${want === 'max' ? 'maior' : 'menor'} é ${m(tx(target))}.`,
    ],
    data: { kind: 'dec-order', values: xs.map(raw), want },
  };
}

// ---------- Operações ----------

function addSub(a: Dec, b: Dec, op: '+' | '-'): Question {
  if (op === '-' && cmp(val(a), val(b)) < 0) [a, b] = [b, a];
  const P = Math.max(a.p, b.p);
  const ai = a.i * 10 ** (P - a.p);
  const bi = b.i * 10 ** (P - b.p);
  const ri = op === '+' ? ai + bi : ai - bi;
  const v = op === '+' ? add(val(a), val(b)) : sub(val(a), val(b));
  const expr = `${tx(a)} ${op} ${tx(b)}`;
  const steps: string[] = [];
  if (a.p !== b.p) {
    steps.push(`Complete com zeros para os dois terem ${casas(P)}: ${m(`${expr} = ${fx(ai, P).replace(',', '{,}')} ${op} ${fx(bi, P).replace(',', '{,}')}`)}.`);
  }
  steps.push(`Com as vírgulas alinhadas, faça a conta como se fossem inteiros: ${m(`${ai} ${op} ${bi} = ${ri}`)}.`);
  const full = fx(ri, P).replace(',', '{,}');
  steps.push(`Recoloque a vírgula com ${casas(P)}: ${m(full === td(v) ? full : `${full} = ${td(v)}`)}.`);
  return {
    prompt: `Calcule: ${M(expr)}`,
    ...numAnswer(v),
    hint: 'Arme a conta com vírgula embaixo de vírgula (décimos com décimos, centésimos com centésimos). Complete com zeros se precisar.',
    steps,
    data: { kind: 'dec-addsub', a: raw(a), b: raw(b), op },
  };
}

function multiply(a: Dec, b: Dec): Question {
  const v = mul(val(a), val(b));
  const P = a.p + b.p;
  const ri = a.i * b.i;
  const expr = `${tx(a)} \\times ${tx(b)}`;
  const full = fx(ri, P).replace(',', '{,}');
  const places = [a, b].filter((x) => x.p > 0).map((x) => `${m(tx(x))} tem ${casas(x.p)}`).join(' e ');
  return {
    prompt: `Calcule: ${M(expr)}`,
    ...numAnswer(v),
    hint: 'Multiplique como se não houvesse vírgula. Depois conte quantas casas decimais os dois fatores têm juntos.',
    steps: [
      `Sem as vírgulas: ${m(`${a.i} \\times ${b.i} = ${ri}`)}.`,
      `${places}: o resultado tem ${casas(P)}.`,
      `Contando ${P} ${P === 1 ? 'casa' : 'casas'} da direita para a esquerda: ${m(full === td(v) ? full : `${full} = ${td(v)}`)}.`,
    ],
    data: { kind: 'dec-mul', a: raw(a), b: raw(b) },
  };
}

/** Divisão montada de trás para frente: dividendo = divisor × quociente. */
function divide(rng: Rng): Question {
  let b: Dec, q: Dec, a: Dec;
  do {
    b = rng.pick([{ i: rng.int(2, 9), p: 0 }, randDec(rng, 1, 4), randDec(rng, 2, 0)]);
    q = rng.pick([{ i: rng.int(2, 40), p: 0 }, randDec(rng, 1, 20), randDec(rng, 2, 3)]);
    a = { i: b.i * q.i, p: b.p + q.p };
    while (a.p > 0 && a.i % 10 === 0) a = { i: a.i / 10, p: a.p - 1 };
  } while (b.i === 1 || (b.p === 0 && q.p === 0) || a.p > 3);
  const v = div(val(a), val(b));
  const expr = `${tx(a)} \\div ${tx(b)}`;
  const steps: string[] = [];
  const k = Math.max(a.p, b.p);
  if (b.p > 0) {
    const f = 10 ** k;
    const A = { i: a.i * 10 ** (k - a.p), p: 0 };
    const B = { i: b.i * 10 ** (k - b.p), p: 0 };
    steps.push(`Multiplique dividendo e divisor por ${pt(f)} (isso não muda o resultado) para sumir com as vírgulas: ${m(`${expr} = ${A.i} \\div ${B.i}`)}.`);
    steps.push(`${m(`${A.i} \\div ${B.i} = ${td(v)}`)}.`);
  } else {
    steps.push(`O divisor é inteiro: divida normalmente e coloque a vírgula no quociente quando passar pela vírgula do dividendo.`);
    steps.push(`${m(`${expr} = ${td(v)}`)}.`);
  }
  steps.push(`Confira multiplicando: ${m(`${tx(b)} \\times ${td(v)} = ${tx(a)}`)}.`);
  return {
    prompt: `Calcule: ${M(expr)}`,
    ...numAnswer(v),
    hint: b.p > 0
      ? `Multiplique os dois números por 10, 100 ou 1000 até o divisor ficar sem vírgula. A divisão continua a mesma.`
      : 'Divida como com inteiros; ao "descer" o primeiro algarismo depois da vírgula, ponha a vírgula no resultado.',
    steps,
    data: { kind: 'dec-div', a: raw(a), b: raw(b) },
  };
}

function pow10(a: Dec, f: number, op: 'mul' | 'div'): Question {
  const k = String(f).length - 1;
  const v = op === 'mul' ? mul(val(a), R(f)) : div(val(a), R(f));
  const sym = op === 'mul' ? '\\times' : '\\div';
  const fT = f === 1000 ? '1{.}000' : String(f);
  const dir = op === 'mul' ? 'direita' : 'esquerda';
  return {
    prompt: `Calcule: ${M(`${tx(a)} ${sym} ${fT}`)}`,
    ...numAnswer(v),
    hint: `${op === 'mul' ? 'Multiplicar' : 'Dividir'} por ${pt(f)} anda com a vírgula ${ORDINAL[k]} para a ${dir} (uma casa para cada zero).`,
    steps: [
      `${pt(f)} tem ${k} ${k === 1 ? 'zero' : 'zeros'}: a vírgula anda ${ORDINAL[k]} para a ${dir}, completando com zeros se faltar algarismo.`,
      `${m(`${tx(a)} ${sym} ${fT} = ${td(v)}`)}.`,
    ],
    data: { kind: 'dec-pow10', a: raw(a), f, op },
  };
}

// ---------- Dinheiro ----------

/** [singular, plural, preço mínimo e máximo em centavos] */
const ITEMS: [string, string, number, number][] = [
  ['caderno', 'cadernos', 900, 2500], ['caneta', 'canetas', 150, 600], ['pão de queijo', 'pães de queijo', 300, 800],
  ['suco', 'sucos', 500, 1200], ['pastel', 'pastéis', 600, 1400], ['sorvete', 'sorvetes', 400, 1500],
  ['coxinha', 'coxinhas', 500, 1000], ['lápis', 'lápis', 100, 350], ['chocolate', 'chocolates', 350, 1200],
  ['refrigerante', 'refrigerantes', 450, 900],
];
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

function change(rng: Rng, multi: boolean): Question {
  const items = rng.shuffle(ITEMS).slice(0, multi ? 2 : 1).map(([one, many, lo, hi]) => {
    const qty = rng.int(1, multi ? 4 : 3);
    const cents = rng.chance(0.5) ? rng.int(lo / 5, hi / 5) * 5 : rng.int(lo, hi);
    return { qty, cents, name: qty > 1 ? many : one };
  });
  if (!multi && items[0].qty === 1) items[0].qty = 2;
  const total = items.reduce((s, it) => s + it.qty * it.cents, 0);
  const notes = [10, 20, 50, 100, 200].filter((n) => n * 100 > total);
  const note = rng.chance(0.75) ? notes[0] : notes[1] ?? notes[0];
  const troco = note * 100 - total;
  const v = R(troco, 100);
  const desc = items.map((it) => `${it.qty} ${it.name} a ${m(money(it.cents))} cada`).join(' e ');
  const steps: string[] = items.map((it) => `${cap(it.name)}: ${m(`${it.qty} \\times ${money(it.cents)} = ${money(it.qty * it.cents)}`)}.`);
  if (items.length > 1) steps.push(`Total da compra: ${m(`${items.map((it) => money(it.qty * it.cents)).join(' + ')} = ${money(total)}`)}.`);
  steps.push(`Troco: ${m(`${money(note * 100)} - ${money(total)} = ${money(troco)}`)}.`);
  return {
    prompt: `Numa compra, alguém levou ${desc}, e pagou com uma nota de ${m(money(note * 100))}. Quanto recebeu de troco?`,
    answer: { type: 'number', value: v },
    answerText: pd(v),
    answerDisplay: m(money(troco)),
    prefix: 'R$',
    keys: [','],
    hint: 'Primeiro calcule quanto custou tudo (quantidade × preço). Troco é o valor pago menos o total.',
    steps,
    data: { kind: 'dec-troco', items: items.map((it) => [it.qty, it.cents]), note },
  };
}

/** [alimento, preço do quilo mínimo e máximo em reais] */
const FOODS: [string, number, number][] = [
  ['tomate', 5, 12], ['queijo', 30, 70], ['banana', 4, 9], ['carne moída', 30, 55], ['café', 40, 80], ['uva', 8, 20], ['feijão', 6, 12],
];

function perKg(rng: Rng): Question {
  const [food, lo, hi] = rng.pick(FOODS);
  const price = rng.int(lo * 10, hi * 10 - 1) * 10; // múltiplo de 10 centavos: o total sai em centavos exatos
  let w: Dec;
  do w = { i: rng.int(3, 35), p: 1 };
  while (w.i % 10 === 0);
  const totalCents = (price * w.i) / 10;
  const v = R(totalCents, 100);
  return {
    prompt: `O quilo de ${food} custa ${m(money(price))}. Quanto custam ${m(`${tx(w)}\\,\\text{kg}`)}?`,
    answer: { type: 'number', value: v },
    answerText: pd(v),
    answerDisplay: m(money(totalCents)),
    prefix: 'R$',
    keys: [','],
    hint: 'Multiplique o preço do quilo pelo peso. Conte as casas decimais dos dois números para pôr a vírgula.',
    steps: [
      `O preço é proporcional ao peso: ${m(`${tx(w)} \\times ${fx(price, 2).replace(',', '{,}')}`)}.`,
      `Sem vírgulas: ${m(`${w.i} \\times ${price} = ${w.i * price}`)}. São ${1 + 2} casas decimais no total: ${m(fx(w.i * price, 3).replace(',', '{,}'))}.`,
      `Total: ${m(money(totalCents))}.`,
    ],
    data: { kind: 'dec-kg', price, weight: raw(w) },
  };
}

function split(rng: Rng): Question {
  const n = rng.int(3, 8);
  const share = rng.chance(0.5) ? rng.int(160, 1800) * 5 : rng.int(800, 9000);
  const total = share * n;
  const v = R(share, 100);
  return {
    prompt: `${n} amigos dividiram igualmente a conta de um restaurante, que deu ${m(money(total))}. Quanto cada um pagou?`,
    answer: { type: 'number', value: v },
    answerText: pd(v),
    answerDisplay: m(money(share)),
    prefix: 'R$',
    keys: [','],
    hint: `Divida o total por ${n}. Se ajudar, pense em centavos: ${m(money(total))} são ${pn(total)} centavos.`,
    steps: [
      `Cada um paga ${m(`${fx(total, 2).replace(',', '{,}')} \\div ${n}`)}.`,
      `Em centavos fica mais fácil: ${m(`${tn(total)} \\div ${n} = ${tn(share)}`)} centavos.`,
      `Ou seja, ${m(money(share))} para cada um. (Confira: ${m(`${n} \\times ${money(share)} = ${money(total)}`)}.)`,
    ],
    data: { kind: 'dec-split', total, n },
  };
}

const decimais: Generator = {
  id: 'decimais',
  title: 'Números decimais',
  generate(level, rng) {
    if (level === 1) {
      const kind = rng.pick(['f2d', 'd2f', 'add', 'add', 'cmp', 'pow'] as const);
      if (kind === 'f2d') return fracToDec(rng, [10, 10, 100, 100, 2, 4, 5]);
      if (kind === 'd2f') return decToFrac(rng, 0);
      if (kind === 'cmp') return compareTwo(rng);
      if (kind === 'pow') return pow10(randDec(rng, rng.int(1, 2), 9), rng.pick([10, 100]), 'mul');
      return addSub(randDec(rng, 1, 9), randDec(rng, 1, 9), rng.pick(['+', '-'] as const));
    }
    if (level === 2) {
      const kind = rng.pick(['add', 'add', 'mulint', 'muldec', 'troco', 'kg', 'f2d'] as const);
      if (kind === 'f2d') return rng.chance(0.5) ? fracToDec(rng, [4, 20, 25, 50]) : decToFrac(rng, 3);
      if (kind === 'mulint') return multiply(randDec(rng, rng.int(1, 2), 15), { i: rng.int(2, 12), p: 0 });
      if (kind === 'muldec') return multiply(randDec(rng, 1, 9), randDec(rng, 1, 3));
      if (kind === 'troco') return change(rng, false);
      if (kind === 'kg') return perKg(rng);
      const p = rng.int(1, 2);
      return addSub(randDec(rng, p, 30), randDec(rng, p + 1, 30), rng.pick(['+', '-'] as const));
    }
    const kind = rng.pick(['div', 'div', 'troco', 'split', 'pow', 'order', 'muldec', 'add'] as const);
    if (kind === 'div') return divide(rng);
    if (kind === 'troco') return change(rng, true);
    if (kind === 'split') return split(rng);
    if (kind === 'pow') {
      if (rng.chance(0.3)) return pow10(randDec(rng, rng.int(1, 3), 20), rng.pick([10, 100, 1000]), 'mul');
      const a = rng.chance(0.4) ? { i: rng.int(1, 999), p: 0 } : randDec(rng, 1, 99);
      return pow10(a, rng.pick([10, 100, 1000]), 'div');
    }
    if (kind === 'order') return order(rng);
    if (kind === 'muldec') return multiply(randDec(rng, 2, 9), randDec(rng, 1, 9));
    return addSub(randDec(rng, rng.pick([0, 1]), 99), randDec(rng, 3, 20), rng.pick(['+', '-'] as const));
  },
};

export default decimais;
