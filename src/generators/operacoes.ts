// As quatro operações: contas armadas, divisão com resto e ordem das operações.

import type { Rng } from '@/lib/math/random';
import { R } from '@/lib/math/rational';
import type { Generator, Question } from './types';
import { m, M, tn, pn, intAnswer, choice } from './_util';

const PLACES = ['Unidades', 'Dezenas', 'Centenas', 'Milhares'];
const digits = (n: number) => String(n).split('').reverse().map(Number);

/* ---------- adição e subtração ---------- */

/** Passos da conta armada de adição, casa por casa, com o "vai um". */
function addSteps(a: number, b: number): string[] {
  const da = digits(a);
  const db = digits(b);
  const steps: string[] = [];
  let carry = 0;
  for (let i = 0; i < Math.max(da.length, db.length); i++) {
    const x = da[i] ?? 0;
    const y = db[i] ?? 0;
    const s = x + y + carry;
    const sum = carry ? `${x} + ${y} + 1` : `${x} + ${y}`;
    steps.push(`${PLACES[i]}: ${m(`${sum} = ${s}`)}${s >= 10 ? `. Escreve ${s % 10} e <b>vai 1</b> para a casa seguinte.` : '.'}`);
    carry = s >= 10 ? 1 : 0;
  }
  if (carry) steps.push(`O 1 que sobrou vai para a casa dos ${PLACES[Math.max(da.length, db.length)].toLowerCase()}.`);
  steps.push(`Resultado: ${m(`${tn(a)} + ${tn(b)} = ${tn(a + b)}`)}.`);
  return steps;
}

/** Passos da conta armada de subtração, com empréstimos. */
function subSteps(a: number, b: number): string[] {
  const da = digits(a);
  const db = digits(b);
  const steps: string[] = [];
  let borrow = 0;
  for (let i = 0; i < da.length; i++) {
    const y = db[i] ?? 0;
    const x = da[i] - borrow;
    if (i > 0 && i === da.length - 1 && x === 0 && y === 0) break;
    const lent = borrow ? `O ${da[i]} emprestou 1 e virou ${x}. ` : '';
    if (x < 0) {
      steps.push(`${PLACES[i]}: o 0 não tem o que emprestar, então pega 1 da casa seguinte (vira 10), empresta 1 e fica 9: ${m(`9 - ${y} = ${9 - y}`)}.`);
      borrow = 1;
    } else if (x < y) {
      steps.push(`${PLACES[i]}: ${lent}Como ${x} é menor que ${y}, pegamos 1 emprestado da casa seguinte: ${m(`${x + 10} - ${y} = ${x + 10 - y}`)}.`);
      borrow = 1;
    } else {
      steps.push(`${PLACES[i]}: ${lent}${m(`${x} - ${y} = ${x - y}`)}.`);
      borrow = 0;
    }
  }
  steps.push(`Resultado: ${m(`${tn(a)} - ${tn(b)} = ${tn(a - b)}`)}. Confira somando: ${m(`${tn(a - b)} + ${tn(b)} = ${tn(a)}`)}.`);
  return steps;
}

function addition(rng: Rng, max: number, context = true): Question {
  const a = rng.int(12, max);
  const b = rng.int(12, max);
  let prompt = `Calcule: ${M(`${tn(a)} + ${tn(b)}`)}`;
  if (context && rng.chance(0.35)) {
    prompt = rng.pick([
      `Uma escola tem ${pn(a)} alunos de manhã e ${pn(b)} à tarde. Quantos alunos ela tem ao todo?`,
      `Uma biblioteca tinha ${pn(a)} livros e recebeu uma doação de ${pn(b)}. Com quantos livros ela ficou?`,
      `Num jogo, o público do primeiro tempo era de ${pn(a)} pessoas, e chegaram mais ${pn(b)} no segundo. Quantas pessoas havia no fim?`,
    ]);
  }
  return {
    prompt,
    answer: intAnswer(a + b),
    answerText: pn(a + b),
    answerDisplay: m(tn(a + b)),
    hint: 'Some casa por casa, começando pelas unidades. Quando a soma de uma casa passar de 9, "vai 1" para a casa seguinte.',
    steps: [`É uma adição: juntar ${m(tn(a))} com ${m(tn(b))}. Arme a conta, unidade embaixo de unidade.`, ...addSteps(a, b)],
    data: { kind: 'op-soma', a, b, result: a + b },
  };
}

function subtraction(rng: Rng, max: number, context = true): Question {
  let a = rng.int(20, max);
  let b = rng.int(10, max);
  if (a < b) [a, b] = [b, a];
  if (a === b) a += rng.int(1, 9);
  let prompt = `Calcule: ${M(`${tn(a)} - ${tn(b)}`)}`;
  if (context && rng.chance(0.35)) {
    prompt = rng.pick([
      `Um cinema tem ${pn(a)} lugares e ${pn(b)} já foram vendidos. Quantos lugares ainda estão livres?`,
      `Uma viagem tem ${pn(a)} km. Já foram percorridos ${pn(b)} km. Quantos quilômetros faltam?`,
      `Ana tinha ${pn(a)} figurinhas e deu ${pn(b)} para o irmão. Com quantas ela ficou?`,
    ]);
  }
  return {
    prompt,
    answer: intAnswer(a - b),
    answerText: pn(a - b),
    answerDisplay: m(tn(a - b)),
    hint: 'Subtraia casa por casa, começando pelas unidades. Se o algarismo de cima for menor, pegue 1 emprestado da casa vizinha (ele vale 10).',
    steps: [`É uma subtração: de ${m(tn(a))} tiramos ${m(tn(b))}. Arme a conta com o maior em cima.`, ...subSteps(a, b)],
    data: { kind: 'op-sub', a, b, result: a - b },
  };
}

function change(rng: Rng): Question {
  const note = rng.pick([20, 50, 100]);
  const price = rng.int(3, note - 1);
  const item = rng.pick(['um lanche', 'um caderno', 'uma camiseta', 'um livro', 'um ingresso de cinema']);
  return {
    prompt: `Você comprou ${item} de R$ ${price} e pagou com uma nota de R$ ${note}. Quanto recebe de troco?`,
    answer: intAnswer(note - price),
    answerText: pn(note - price),
    prefix: 'R$',
    answerDisplay: `R$ ${note - price}`,
    hint: 'Troco é o que sobra: valor pago menos o preço.',
    steps: [
      `Troco = valor pago − preço: ${m(`${note} - ${price}`)}.`,
      `Outro jeito, o do caixa: conte de ${price} até ${note}. ${m(`${price} + ${note - price} = ${note}`)}.`,
      `Troco: R$ ${note - price}.`,
    ],
    data: { kind: 'op-sub', a: note, b: price, result: note - price },
  };
}

/* ---------- multiplicação e divisão ---------- */

function tableSteps(a: number, b: number): string[] {
  if (b <= 5) {
    return [
      `${m(`${a} \\times ${b}`)} são ${b} grupos de ${a}: ${m(`${Array(b).fill(a).join(' + ')} = ${a * b}`)}.`,
    ];
  }
  return [
    `Truque: quebre o ${b} em ${m(`5 + ${b - 5}`)}. Então ${m(`${a} \\times ${b} = ${a} \\times 5 + ${a} \\times ${b - 5}`)}.`,
    `${m(`${a * 5} + ${a * (b - 5)} = ${a * b}`)}.`,
  ];
}

function table(rng: Rng): Question {
  const a = rng.int(2, 10);
  const b = rng.int(2, 10);
  return {
    prompt: `Calcule: ${M(`${a} \\times ${b}`)}`,
    answer: intAnswer(a * b),
    answerText: pn(a * b),
    answerDisplay: m(tn(a * b)),
    hint: `${m(`${a} \\times ${b}`)} é juntar ${b} grupos de ${a}. Se não lembrar, some ${a} várias vezes.`,
    steps: [...tableSteps(a, b), `Resultado: ${m(`${a} \\times ${b} = ${a * b}`)}.`],
    data: { kind: 'op-mul', a, b, result: a * b },
  };
}

/** Multiplicação com mais algarismos, resolvida pela propriedade distributiva. */
function bigProduct(rng: Rng): Question {
  const twoByTwo = rng.chance(0.5);
  const a = twoByTwo ? rng.int(12, 99) : rng.int(13, 250);
  const b = twoByTwo ? rng.int(11, 39) : rng.int(3, 9);
  const steps: string[] = [];
  if (twoByTwo) {
    const t = b - (b % 10);
    const u = b % 10;
    steps.push(u
      ? `Quebre o ${b} em ${m(`${t} + ${u}`)}: multiplique por partes e some.`
      : `Multiplicar por ${b} é multiplicar por ${t / 10} e depois por 10.`);
    if (u) {
      steps.push(`${m(`${a} \\times ${t} = ${tn(a * t)}`)} e ${m(`${a} \\times ${u} = ${tn(a * u)}`)}.`);
      steps.push(`${m(`${tn(a * t)} + ${tn(a * u)} = ${tn(a * b)}`)}.`);
    } else {
      steps.push(`${m(`${a} \\times ${t / 10} = ${tn(a * (t / 10))}`)}; vezes 10, acrescente um zero: ${m(tn(a * b))}.`);
    }
  } else {
    const parts = digits(a).map((d, i) => d * 10 ** i).filter((p) => p > 0).reverse();
    steps.push(`Quebre o ${a} em ${m(parts.join(' + '))} e multiplique cada parte por ${b}.`);
    steps.push(`${m(parts.map((p) => `${tn(p * b)}`).join(' + ') + ` = ${tn(a * b)}`)}.`);
  }
  let prompt = `Calcule: ${M(`${a} \\times ${b}`)}`;
  if (rng.chance(0.35)) {
    prompt = rng.pick([
      `Um ônibus tem ${a} lugares. Quantas pessoas cabem em ${b} ônibus iguais a ele?`,
      `Uma caixa tem ${a} lápis. Quantos lápis há em ${b} caixas?`,
      `Um livro custa R$ ${a}. Quanto custam ${b} livros?`,
    ]);
  }
  return {
    prompt,
    answer: intAnswer(a * b),
    answerText: pn(a * b),
    answerDisplay: m(tn(a * b)),
    hint: 'Quebre um dos números em dezenas e unidades, multiplique cada parte e some os resultados.',
    steps: [...steps, `Resultado: ${m(`${a} \\times ${b} = ${tn(a * b)}`)}.`],
    data: { kind: 'op-mul', a, b, result: a * b },
  };
}

/** Divisão exata, montada de trás para frente: dividendo = divisor × quociente. */
function exactDivision(rng: Rng): Question {
  const d = rng.int(2, 12);
  const q = rng.int(3, 60);
  const n = d * q;
  const steps: string[] = [`Dividir ${n} por ${d} é perguntar: ${m(`${d} \\times {?} = ${n}`)}.`];
  if (q >= 10) {
    const t = q - (q % 10);
    const u = q % 10;
    steps.push(`Comece com um número redondo: ${m(`${d} \\times ${t} = ${d * t}`)}. ${u ? `Sobram ${m(`${n} - ${d * t} = ${n - d * t}`)}.` : 'Não sobra nada.'}`);
    if (u) steps.push(`E ${m(`${d} \\times ${u} = ${d * u}`)}. Então o quociente é ${m(`${t} + ${u} = ${q}`)}.`);
  } else {
    steps.push(`Pela tabuada do ${d}: ${m(`${d} \\times ${q} = ${n}`)}.`);
  }
  steps.push(`Resultado: ${m(`${n} \\div ${d} = ${q}`)}. Confira: ${m(`${d} \\times ${q} = ${n}`)}.`);
  let prompt = `Calcule: ${M(`${tn(n)} \\div ${d}`)}`;
  if (rng.chance(0.35)) {
    prompt = rng.pick([
      `Uma conta de R$ ${n} vai ser dividida igualmente entre ${d} amigos. Quanto cada um paga?`,
      `${n} alunos vão ser organizados em ${d} filas com o mesmo número de alunos. Quantos alunos ficam em cada fila?`,
      `Uma fazenda colheu ${n} mangas e quer distribuí-las igualmente em ${d} caixas. Quantas mangas vão em cada caixa?`,
    ]);
  }
  return {
    prompt,
    answer: intAnswer(q),
    answerText: pn(q),
    answerDisplay: m(tn(q)),
    hint: `A divisão desfaz a multiplicação: procure o número que, vezes ${d}, dá ${n}.`,
    steps,
    data: { kind: 'op-div', n, d, result: q },
  };
}

/** Divisão com resto: dividendo = divisor × quociente + resto, com 0 < resto < divisor. */
function remainderDivision(rng: Rng): Question {
  const d = rng.int(2, 9);
  const q = rng.int(3, 30);
  const r = rng.int(1, d - 1);
  const n = d * q + r;
  const story = rng.chance(0.4);
  const [item, pack, quantos] = rng.pick([
    ['figurinhas', 'envelopes', 'Quantos'],
    ['ovos', 'caixas', 'Quantas'],
    ['bombons', 'saquinhos', 'Quantos'],
  ] as const);
  const labels = story ? [pack, 'sobram'] : ['quociente', 'resto'];
  return {
    prompt: story
      ? `Você tem ${n} ${item} para guardar em ${pack} com ${d} em cada. ${quantos} ${pack} ficam completos, e quantos ${item} sobram?`
      : `Divida ${m(`${n} \\div ${d}`)} e informe o <b>quociente</b> e o <b>resto</b>.`,
    answer: { type: 'fields', fields: [{ label: labels[0], value: R(q) }, { label: labels[1], value: R(r) }] },
    answerText: `${q};${r}`,
    answerDisplay: `quociente ${m(String(q))}, resto ${m(String(r))}`,
    hint: `Procure o maior múltiplo de ${d} que não passa de ${n}. O que faltar para chegar a ${n} é o resto (e ele precisa ser menor que ${d}).`,
    steps: [
      `Múltiplos de ${d} perto de ${n}: ${m(`${d} \\times ${q} = ${d * q}`)} e ${m(`${d} \\times ${q + 1} = ${d * (q + 1)}`)}. O segundo já passa de ${n}.`,
      `Então o quociente é ${m(String(q))}, e o resto é ${m(`${n} - ${d * q} = ${r}`)}.`,
      `Confira (divisor × quociente + resto): ${m(`${d} \\times ${q} + ${r} = ${n}`)}.`,
    ],
    data: { kind: 'op-resto', n, d, q, r },
  };
}

/** Número que falta, achado pela operação inversa. */
function missing(rng: Rng, op: '+' | 'x'): Question {
  const known = op === '+' ? rng.int(11, 90) : rng.int(2, 10);
  const result = op === '+' ? rng.int(5, 90) : rng.int(2, 10);
  const total = op === '+' ? known + result : known * result;
  const sym = op === '+' ? '+' : '\\times';
  const first = rng.chance(0.5);
  const eqTex = first ? `\\square ${sym} ${known} = ${total}` : `${known} ${sym} \\square = ${total}`;
  const inv = op === '+' ? `${total} - ${known}` : `${total} \\div ${known}`;
  return {
    prompt: `Que número vai no quadradinho? ${M(eqTex)}`,
    answer: intAnswer(result),
    answerText: pn(result),
    answerDisplay: m(tn(result)),
    hint: op === '+' ? 'A subtração desfaz a adição.' : 'A divisão desfaz a multiplicação.',
    steps: [
      `${op === '+' ? 'A subtração desfaz a adição' : 'A divisão desfaz a multiplicação'}: ${m(`\\square = ${inv} = ${result}`)}.`,
      `Confira: ${m(eqTex.replace('\\square', String(result)))}.`,
    ],
    data: { kind: 'op-lacuna', op, known, total, result },
  };
}

/* ---------- expressões e ordem das operações ---------- */

type Tok = number | '+' | '-' | '*' | '/' | '(' | ')';
const OPS: Record<string, string> = { '+': '+', '-': '-', '*': '\\times', '/': '\\div' };

const tokenize = (s: string): Tok[] =>
  (s.match(/\d+|[-+*/()]/g) ?? []).map((t) => (/\d/.test(t) ? Number(t) : (t as Tok)));

function texOf(toks: Tok[]): string {
  return toks
    .map((t) => {
      if (typeof t === 'number') return tn(t);
      if (t === '(' || t === ')') return t;
      return ` ${OPS[t]} `;
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Resolve a expressão uma operação por vez, na ordem convencional, registrando os passos. */
function solve(expr: string): { result: number; steps: string[] } {
  const toks = tokenize(expr);
  const steps: string[] = [];
  while (toks.length > 1) {
    const close = toks.indexOf(')');
    const open = close >= 0 ? toks.lastIndexOf('(', close) : -1;
    const lo = open + 1;
    const hi = close >= 0 ? close : toks.length;
    const range = toks.slice(lo, hi);
    const hasMul = range.some((t) => t === '*' || t === '/');
    const hasAdd = range.some((t) => t === '+' || t === '-');
    let i = range.findIndex((t) => t === '*' || t === '/');
    if (i < 0) i = range.findIndex((t) => t === '+' || t === '-');
    i += lo;
    const [a, op, b] = toks.slice(i - 1, i + 2) as [number, Tok, number];
    const r = op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : a / b;
    if (r < 0 || !Number.isInteger(r)) throw new Error('expressão inválida');

    const name = { '+': 'a adição', '-': 'a subtração', '*': 'a multiplicação', '/': 'a divisão' }[op as string];
    const sameLevel = range.filter((t) => (hasMul && (op === '*' || op === '/') ? t === '*' || t === '/' : t === '+' || t === '-')).length;
    let label = close >= 0
      ? `Parênteses primeiro${hasMul && hasAdd ? `; dentro deles, ${name} vem antes` : ''}`
      : `${steps.length ? 'Agora' : 'Primeiro,'} ${name}`;
    if (close < 0 && (op === '*' || op === '/') && hasAdd) label += ' (× e ÷ vêm antes de + e −)';
    if (sameLevel > 1) label += ', da esquerda para a direita';

    toks.splice(i - 1, 3, r);
    if (close >= 0 && toks[lo - 1] === '(' && toks[lo + 1] === ')') toks.splice(lo - 1, 3, r);
    steps.push(`${label}: ${m(`${tn(a)} ${OPS[op as string]} ${tn(b)} = ${tn(r)}`)}.${toks.length > 1 ? ` Fica ${m(texOf(toks))}.` : ''}`);
  }
  return { result: toks[0] as number, steps };
}

/** Sorteia até a expressão ser válida (divisões exatas e nenhum resultado negativo). */
function draw(rng: Rng, make: (rng: Rng) => string): { expr: string; result: number; steps: string[] } {
  for (;;) {
    const expr = make(rng);
    try {
      return { expr, ...solve(expr) };
    } catch {
      // tenta de novo
    }
  }
}

const LEFT_TO_RIGHT: ((rng: Rng) => string)[] = [
  (r) => `${r.int(15, 60)} - ${r.int(2, 14)} + ${r.int(2, 20)}`,
  (r) => { const b = r.int(2, 9); return `${b * r.int(2, 9)} / ${b} * ${r.int(2, 9)}`; },
  (r) => `${r.int(2, 30)} + ${r.int(2, 9)} * ${r.int(2, 9)}`,
  (r) => `${r.int(40, 99)} - ${r.int(2, 6)} * ${r.int(2, 9)}`,
];

const ORDER: ((rng: Rng) => string)[] = [
  (r) => { const e = r.int(2, 6); const k = r.int(2, 9); const d = r.int(2, 9); return `${r.int(1, 30)} + ${e * r.int(1, 5)} * (${d + k} - ${d}) / ${e}`; },
  (r) => { const d = r.int(2, 9); return `${r.int(3, 12)} * ${r.int(3, 12)} - ${d * r.int(2, 9)} / ${d}`; },
  (r) => `(${r.int(2, 15)} + ${r.int(2, 15)}) * ${r.int(2, 6)} - ${r.int(1, 30)}`,
  (r) => { const k = r.int(2, 9); const c = r.int(1, 20); return `${k * r.int(2, 9)} / (${c + k} - ${c}) + ${r.int(2, 9)} * ${r.int(2, 9)}`; },
  (r) => { const d = r.int(2, 8); const s = d * r.int(2, 9); const b = r.int(1, s - 1); return `${r.int(10, 60)} - (${b} + ${s - b}) / ${d}`; },
  (r) => `${r.int(2, 9)} * (${r.int(2, 12)} + ${r.int(2, 12)}) - ${r.int(2, 9)} * ${r.int(2, 6)}`,
  (r) => { const e = r.int(2, 5); const c = r.int(1, 9); return `(${c + e * r.int(1, 4)} - ${c}) * (${r.int(1, 9)} + ${r.int(1, 9)}) / ${e}`; },
  (r) => `${r.int(20, 80)} - ${r.int(2, 9)} * ${r.int(2, 5)} + ${r.int(2, 30)}`,
];

function expression(rng: Rng, makers: ((rng: Rng) => string)[]): Question {
  const { expr, result, steps } = draw(rng, rng.pick(makers));
  const tex = texOf(tokenize(expr));
  return {
    prompt: `Calcule: ${M(tex)}`,
    answer: intAnswer(result),
    answerText: pn(result),
    answerDisplay: m(tn(result)),
    hint: 'Ordem: primeiro os parênteses; depois × e ÷, da esquerda para a direita; por último + e −, da esquerda para a direita.',
    steps: [...steps, `Resultado: ${m(tn(result))}.`],
    data: { kind: 'op-expr', expr, result },
  };
}

/** Avalia da esquerda para a direita ignorando a prioridade: o erro mais comum. */
function naive(expr: string): number {
  const t = tokenize(expr);
  let v = t[0] as number;
  for (let i = 1; i < t.length; i += 2) {
    const b = t[i + 1] as number;
    v = t[i] === '+' ? v + b : t[i] === '-' ? v - b : t[i] === '*' ? v * b : v / b;
  }
  return v;
}

function orderChoice(rng: Rng): Question {
  for (;;) {
    const a = rng.int(2, 20);
    const b = rng.int(2, 9);
    const c = rng.int(2, 9);
    const op1 = rng.pick(['+', '-'] as const);
    const expr = op1 === '+' ? `${a} + ${b} * ${c}` : `${a + b * c + rng.int(0, 15)} - ${b} * ${c}`;
    const { result, steps } = solve(expr);
    const wrong = [naive(expr), result + b, Math.abs(result - c)].filter((v) => Number.isInteger(v) && v >= 0 && v !== result);
    const uniq = [...new Set(wrong)].slice(0, 2);
    if (uniq.length < 2) continue;
    const tex = texOf(tokenize(expr));
    return {
      prompt: `Qual é o valor de ${m(tex)}?`,
      answer: choice(rng, m(tn(result)), uniq.map((v) => m(tn(v)))),
      answerDisplay: m(tn(result)),
      hint: 'Cuidado: a multiplicação vem antes da adição e da subtração, mesmo estando à direita.',
      steps: [...steps, `Resultado: ${m(tn(result))}. Quem faz a conta da esquerda para a direita sem olhar a prioridade chega em ${m(tn(naive(expr)))}, que está errado.`],
      data: { kind: 'op-ordem', expr, result },
    };
  }
}

/** Problemas de várias etapas: o texto vira uma expressão. */
function wordExpression(rng: Rng): Question {
  const kind = rng.int(0, 2);
  let prompt: string;
  let expr: string;
  let setup: string;
  let money = true;
  if (kind === 0) {
    const n1 = rng.int(2, 5), p1 = rng.int(3, 15), n2 = rng.int(2, 6), p2 = rng.int(2, 9);
    const pay = [50, 100, 200].find((v) => v >= n1 * p1 + n2 * p2)!;
    prompt = `Na papelaria, Júlia comprou ${n1} cadernos de R$ ${p1} cada e ${n2} canetas de R$ ${p2} cada. Pagou com R$ ${pay}. Quanto recebeu de troco?`;
    expr = `${pay} - (${n1} * ${p1} + ${n2} * ${p2})`;
    setup = 'Troco = pago − (cadernos + canetas)';
  } else if (kind === 1) {
    const n = rng.int(3, 8), q = rng.int(15, 60);
    const extra = rng.int(5, 40);
    const total = n * q;
    prompt = `Num restaurante, ${n} amigos pediram uma pizza grande e bebidas. A pizza custou R$ ${total - extra} e as bebidas, R$ ${extra}. Eles dividiram a conta igualmente. Quanto pagou cada um?`;
    expr = `(${total - extra} + ${extra}) / ${n}`;
    setup = 'Cada um = (pizza + bebidas) ÷ amigos';
  } else {
    const s = rng.int(2, 9) * 5, w = rng.int(3, 8), g = rng.int(1, 20) * 5;
    if (g > s * w) return wordExpression(rng);
    money = rng.chance(0.5);
    prompt = money
      ? `Pedro recebe R$ ${s} de mesada por semana. Depois de ${w} semanas, gastou R$ ${g} num jogo. Quanto dinheiro sobrou?`
      : `Uma impressora imprime ${s} páginas por minuto. Ela funcionou ${w} minutos, mas ${g} páginas saíram borradas. Quantas páginas saíram boas?`;
    expr = `${s} * ${w} - ${g}`;
    setup = money ? 'Sobra = mesada × semanas − gasto' : 'Boas = páginas por minuto × minutos − borradas';
  }
  const { result, steps } = solve(expr);
  return {
    prompt,
    answer: intAnswer(result),
    answerText: pn(result),
    prefix: money ? 'R$' : undefined,
    answerDisplay: money ? `R$ ${pn(result)}` : m(tn(result)),
    hint: 'Transforme o texto numa expressão (use parênteses para agrupar o que precisa ser feito antes) e resolva na ordem certa.',
    steps: [`${setup}: ${m(texOf(tokenize(expr)))}.`, ...steps],
    data: { kind: 'op-expr', expr, result },
  };
}

/** Divisão com resto em que a resposta é arredondada para cima (o resto também precisa de lugar). */
function vans(rng: Rng): Question {
  const cap = rng.pick([4, 5, 8, 12, 15, 40, 44]);
  const full = rng.int(2, 9);
  const r = rng.int(1, cap - 1);
  const n = cap * full + r;
  const [who, car, one, fem] = cap <= 5
    ? ['pessoas', 'carros', 'carro', false]
    : cap <= 15 ? ['passageiros', 'vans', 'van', true] : ['alunos', 'ônibus', 'ônibus', false];
  return {
    prompt: `Uma excursão tem ${n} ${who}. Cada ${one} leva no máximo ${cap} ${who}. ${fem ? 'Quantas' : 'Quantos'} ${car}, no mínimo, são ${fem ? 'necessárias' : 'necessários'}?`,
    answer: intAnswer(full + 1),
    answerText: pn(full + 1),
    answerDisplay: m(tn(full + 1)),
    hint: 'Divida e olhe o resto: quem sobra também precisa ir!',
    steps: [
      `Divida: ${m(`${n} = ${cap} \\times ${full} + ${r}`)}. Ou seja, ${full} ${car} ${fem ? 'lotadas' : 'lotados'} e ${r} ${who} sobrando.`,
      `Esses ${r} não podem ficar para trás: é preciso mais 1. Total: ${m(`${full} + 1 = ${full + 1}`)}.`,
    ],
    data: { kind: 'op-vans', n, cap, result: full + 1 },
  };
}

const operacoes: Generator = {
  id: 'operacoes',
  title: 'As quatro operações',
  generate(level, rng) {
    if (level === 1) {
      const kind = rng.pick(['add', 'add', 'sub', 'sub', 'change', 'table', 'table', 'miss'] as const);
      if (kind === 'add') return addition(rng, 499);
      if (kind === 'sub') return subtraction(rng, 999);
      if (kind === 'change') return change(rng);
      if (kind === 'table') return table(rng);
      return missing(rng, '+');
    }
    if (level === 2) {
      const kind = rng.pick(['mul', 'mul', 'div', 'div', 'rest', 'rest', 'miss', 'expr', 'add'] as const);
      if (kind === 'mul') return bigProduct(rng);
      if (kind === 'div') return exactDivision(rng);
      if (kind === 'rest') return remainderDivision(rng);
      if (kind === 'miss') return missing(rng, 'x');
      if (kind === 'expr') return expression(rng, LEFT_TO_RIGHT);
      return rng.chance(0.5) ? addition(rng, 4999, false) : subtraction(rng, 9999, false);
    }
    const kind = rng.pick(['expr', 'expr', 'expr', 'order', 'word', 'word', 'vans'] as const);
    if (kind === 'expr') return expression(rng, ORDER);
    if (kind === 'order') return orderChoice(rng);
    if (kind === 'word') return wordExpression(rng);
    return vans(rng);
  },
};

export default operacoes;
