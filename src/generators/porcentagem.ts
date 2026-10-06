// Porcentagem: partes de cem, aumentos, descontos, variações sucessivas e juros simples.

import type { Rng } from '@/lib/math/random';
import { R, add, div, mul, sub, type Rational } from '@/lib/math/rational';
import type { Generator, Question } from './types';
import { m, tn, td, pd, choice } from './_util';

const num = (v: Rational) => ({ type: 'number' as const, value: v });

/** Número em LaTeX: inteiro ou decimal finito, com separador de milhar. */
function tx(v: Rational): string {
  const [i, f] = td(v).split('{,}');
  return (v.n < 0 ? '-' : '') + tn(Math.abs(parseInt(i, 10))) + (f ? `{,}${f}` : '');
}
/** Número em texto puro (sem separador de milhar, para não confundir com decimal). */
const px = (v: Rational) => pd(v);
/** Porcentagem em LaTeX. */
const tp = (v: Rational | number) => `${tx(typeof v === 'number' ? R(v) : v)}\\%`;

function cents(v: Rational): number {
  const c = (v.n * 100) / v.d;
  if (!Number.isInteger(c)) throw new Error(`valor com mais de 2 casas: ${v.n}/${v.d}`);
  return c;
}
/** Dinheiro em LaTeX: R$ 1.234,50. */
function brl(v: Rational): string {
  const c = Math.abs(cents(v));
  const f = c % 100;
  return `${v.n < 0 ? '-' : ''}\\text{R\\$}\\,${tn((c - f) / 100)}${f ? `{,}${String(f).padStart(2, '0')}` : ''}`;
}
/** Dinheiro como alguém digitaria: 1234,50. */
function brlText(v: Rational): string {
  const c = Math.abs(cents(v));
  const f = c % 100;
  return `${v.n < 0 ? '-' : ''}${(c - f) / 100}${f ? `,${String(f).padStart(2, '0')}` : ''}`;
}

const pctOf = (p: Rational | number, n: Rational | number) =>
  mul(typeof p === 'number' ? R(p, 100) : div(p, R(100)), typeof n === 'number' ? R(n) : n);

/** Um valor N múltiplo do que for preciso para p% de N dar inteiro. */
function niceBase(rng: Rng, p: number, max: number): number {
  const step = 100 / gcdInt(p, 100);
  const top = Math.max(1, Math.floor(max / step));
  return step * rng.int(1, top);
}
function gcdInt(a: number, b: number): number {
  while (b) [a, b] = [b, a % b];
  return a;
}

// ---------------------------------------------------------------------------
// x% de N

const OF_CONTEXTS: ((p: number, n: number) => string)[] = [
  (p, n) => `Calcule ${m(`${tp(p)}\\text{ de }${tn(n)}`)}.`,
  (p, n) => `Quanto é ${m(tp(p))} de ${m(tn(n))}?`,
  (p, n) => `Uma escola tem ${m(tn(n))} alunos, e ${m(tp(p))} deles vão de bicicleta. Quantos alunos vão de bicicleta?`,
  (p, n) => `Uma pesquisa ouviu ${m(tn(n))} pessoas, e ${m(tp(p))} disseram que preferem praia a montanha. Quantas pessoas são?`,
  (p, n) => `Um álbum tem ${m(tn(n))} figurinhas. Você já colou ${m(tp(p))} delas. Quantas figurinhas já estão coladas?`,
];

function trickFor(p: number, n: number): string | null {
  const N = R(n);
  if (p === 50) return `${m(tp(50))} é a metade: ${m(`${tn(n)} \\div 2 = ${tx(div(N, R(2)))}`)}.`;
  if (p === 25) return `${m(tp(25))} é a metade da metade: ${m(`${tn(n)} \\div 4 = ${tx(div(N, R(4)))}`)}.`;
  if (p === 75) return `${m(tp(75))} são três quartos: ${m(`${tn(n)} \\div 4 = ${tx(div(N, R(4)))}`)}, e ${m(`3 \\cdot ${tx(div(N, R(4)))} = ${tx(pctOf(75, n))}`)}.`;
  if (p === 10) return `${m(tp(10))} é dividir por 10: ${m(`${tn(n)} \\div 10 = ${tx(div(N, R(10)))}`)}.`;
  if (p === 1) return `${m(tp(1))} é dividir por 100: ${m(`${tn(n)} \\div 100 = ${tx(div(N, R(100)))}`)}.`;
  if (p % 10 === 0) {
    const ten = div(N, R(10));
    return `${m(tp(10))} de ${m(tn(n))} é ${m(tx(ten))}. Então ${m(tp(p))} é ${m(`${p / 10} \\cdot ${tx(ten)} = ${tx(pctOf(p, n))}`)}.`;
  }
  if (p === 5) {
    const ten = div(N, R(10));
    return `${m(tp(10))} de ${m(tn(n))} é ${m(tx(ten))}, e ${m(tp(5))} é a metade disso: ${m(tx(pctOf(5, n)))}.`;
  }
  return null;
}

function percentOf(rng: Rng, p: number, n: number, story: boolean): Question {
  const result = pctOf(p, n);
  const one = div(R(n), R(100));
  const prompt = (story ? rng.pick(OF_CONTEXTS) : OF_CONTEXTS[rng.int(0, 1)])(p, n);
  const steps = [
    `Porcentagem é "por cem": ${m(`${tp(p)} = \\frac{${p}}{100}`)}.`,
    `Multiplique pelo total: ${m(`\\frac{${p}}{100} \\cdot ${tn(n)} = \\frac{${tn(p * n)}}{100} = ${tx(result)}`)}.`,
  ];
  const trick = trickFor(p, n);
  steps.push(trick ? `Atalho de cabeça: ${trick}` : `Outro caminho: ${m(tp(1))} de ${m(tn(n))} é ${m(tx(one))}, e ${m(`${p} \\cdot ${tx(one)} = ${tx(result)}`)}.`);
  return {
    prompt,
    answer: num(result),
    answerText: px(result),
    answerDisplay: m(tx(result)),
    hint: `${m(tp(p))} quer dizer ${p} em cada 100. Divida ${m(tn(n))} por 100 e multiplique por ${p} (ou use um atalho, como 10% = dividir por 10).`,
    steps,
    keys: [','],
    data: { kind: 'pct-de', p, n, result },
  };
}

// ---------------------------------------------------------------------------
// Conversões

function convert(rng: Rng): Question {
  const dir = rng.pick(['to-dec', 'to-pct', 'frac'] as const);
  if (dir === 'frac') {
    const den = rng.pick([2, 4, 5, 10, 20, 25, 50]);
    let numr = rng.int(1, den - 1);
    while (gcdInt(numr, den) !== 1) numr = rng.int(1, den - 1);
    const p = (numr * 100) / den;
    return {
      prompt: `Escreva a fração ${m(`\\frac{${numr}}{${den}}`)} como porcentagem.`,
      answer: num(R(p)),
      answerText: String(p),
      suffix: '%',
      answerDisplay: m(tp(p)),
      hint: `Porcentagem é uma fração com denominador 100. Por quanto multiplicar ${m(String(den))} para chegar a 100?`,
      steps: [
        `Queremos denominador 100: ${m(`100 \\div ${den} = ${100 / den}`)}.`,
        `Multiplique em cima e embaixo por ${100 / den}: ${m(`\\frac{${numr}}{${den}} = \\frac{${p}}{100} = ${tp(p)}`)}.`,
      ],
      keys: [',', '%'],
      data: { kind: 'pct-conv', dir, p, numr, den },
    };
  }
  const p = rng.chance(0.2) ? rng.pick([120, 150, 200, 5, 8, 3]) : rng.int(1, 99);
  const dec = R(p, 100);
  if (dir === 'to-dec') {
    return {
      prompt: `Escreva ${m(tp(p))} na forma de número decimal.`,
      answer: num(dec),
      answerText: px(dec),
      answerDisplay: m(td(dec)),
      hint: `${m(tp(p))} é ${m(`\\frac{${p}}{100}`)}: divida ${p} por 100 (a vírgula anda duas casas para a esquerda).`,
      steps: [
        `${m(`${tp(p)} = \\frac{${p}}{100}`)}.`,
        `Dividir por 100 é andar com a vírgula duas casas para a esquerda: ${m(`${tp(p)} = ${td(dec)}`)}.`,
      ],
      keys: [','],
      data: { kind: 'pct-conv', dir, p, value: px(dec) },
    };
  }
  return {
    prompt: `Escreva o número ${m(td(dec))} como porcentagem.`,
    answer: num(R(p)),
    answerText: String(p),
    suffix: '%',
    answerDisplay: m(tp(p)),
    hint: 'Para virar porcentagem, multiplique por 100 (a vírgula anda duas casas para a direita).',
    steps: [
      `Multiplique por 100 para ver "quantos em cada 100": ${m(`${td(dec)} \\cdot 100 = ${p}`)}.`,
      `Logo, ${m(`${td(dec)} = \\frac{${p}}{100} = ${tp(p)}`)}.`,
    ],
    keys: [',', '%'],
    data: { kind: 'pct-conv', dir, p, value: px(dec) },
  };
}

// ---------------------------------------------------------------------------
// Aumento e desconto

const ITEMS = ['uma camiseta', 'um tênis', 'uma bicicleta', 'um celular', 'uma mochila', 'um fone de ouvido', 'um jogo de videogame', 'uma passagem de ônibus'];

function change(rng: Rng): Question {
  const up = rng.chance(0.4);
  const p = up ? rng.pick([5, 8, 10, 12, 15, 20, 25, 30, 40, 50]) : rng.pick([5, 10, 12, 15, 20, 25, 30, 35, 40, 60]);
  const base = rng.chance(0.6) ? rng.int(4, 60) * 10 : rng.int(30, 900);
  const factor = R(100 + (up ? p : -p), 100);
  const result = mul(R(base), factor);
  const delta = pctOf(p, base);
  const item = rng.pick(ITEMS);
  const prompt = up
    ? `O preço de ${item} era ${m(brl(R(base)))} e subiu ${m(tp(p))}. Qual é o novo preço?`
    : `${item[0].toUpperCase() + item.slice(1)} custa ${m(brl(R(base)))}. Na promoção, tem ${m(tp(p))} de desconto. Quanto passa a custar?`;
  return {
    prompt,
    answer: num(result),
    answerText: brlText(result),
    prefix: 'R$',
    answerDisplay: m(brl(result)),
    hint: up
      ? `Calcule ${m(tp(p))} do preço e some. Ou multiplique direto por ${m(td(factor))}, que é ${m(`100\\% + ${tp(p)}`)}.`
      : `Calcule ${m(tp(p))} do preço e subtraia. Ou multiplique direto por ${m(td(factor))}: você paga ${m(tp(100 - p))}.`,
    steps: [
      `${m(tp(p))} de ${m(brl(R(base)))}: ${m(`\\frac{${p}}{100} \\cdot ${tn(base)} = ${tx(delta)}`)}.`,
      up
        ? `Novo preço: ${m(`${tn(base)} + ${tx(delta)} = ${tx(result)}`)}.`
        : `Preço com desconto: ${m(`${tn(base)} - ${tx(delta)} = ${tx(result)}`)}.`,
      `Atalho com fator: ${m(`${tn(base)} \\cdot ${td(factor)} = ${tx(result)}`)}. Resposta: ${m(brl(result))}.`,
    ],
    keys: [','],
    data: { kind: 'pct-var', base, p, up, result: px(result) },
  };
}

// ---------------------------------------------------------------------------
// Que porcentagem A é de B?

const PART_CONTEXTS: ((a: number, b: number) => string)[] = [
  (a, b) => `${m(tn(a))} é quantos por cento de ${m(tn(b))}?`,
  (a, b) => `Numa turma de ${m(tn(b))} estudantes, ${m(tn(a))} usam óculos. Que porcentagem da turma usa óculos?`,
  (a, b) => `Um time disputou ${m(tn(b))} partidas e venceu ${m(tn(a))}. Qual foi a porcentagem de vitórias?`,
  (a, b) => `De um salário de ${m(brl(R(b)))}, ${m(brl(R(a)))} vão para o aluguel. Que porcentagem do salário é o aluguel?`,
  (a, b) => `Numa prova com ${m(tn(b))} questões, você acertou ${m(tn(a))}. Qual a sua porcentagem de acertos?`,
];

function partOf(rng: Rng): Question {
  const ctx = rng.int(0, PART_CONTEXTS.length - 1);
  const whole = ctx === 3 ? rng.int(15, 60) * 100 : rng.pick([20, 25, 40, 50, 80, 200, 250, 400, 500, 30, 60, 120, 160]);
  let p: number;
  do p = rng.int(1, 99);
  while ((p * whole) % 100 !== 0);
  const part = (p * whole) / 100;
  return {
    prompt: PART_CONTEXTS[ctx](part, whole),
    answer: num(R(p)),
    answerText: String(p),
    suffix: '%',
    answerDisplay: m(tp(p)),
    hint: `Escreva a fração ${m('\\frac{\\text{parte}}{\\text{todo}}')} e descubra quanto ela vale em cada 100.`,
    steps: [
      `A fração é ${m(`\\frac{${tn(part)}}{${tn(whole)}}`)}.`,
      `Divida: ${m(`${tn(part)} \\div ${tn(whole)} = ${td(R(p, 100))}`)}.`,
      `Multiplique por 100 para ler em porcentagem: ${m(`${td(R(p, 100))} = ${tp(p)}`)}.`,
    ],
    keys: [',', '%'],
    data: { kind: 'pct-qual', part, whole, result: p },
  };
}

// ---------------------------------------------------------------------------
// Taxa de variação: passou de A para B

function rate(rng: Rng): Question {
  const from = rng.pick([20, 25, 40, 50, 80, 120, 150, 200, 250, 400, 500, 800]);
  let p: number;
  do p = rng.nonZero(-60, 80);
  while ((p * from) % 100 !== 0);
  const to = from + (p * from) / 100;
  const what = rng.pick([
    { a: 'O preço de um produto passou', unit: (v: number) => brl(R(v)) },
    { a: 'O número de seguidores de um perfil passou', unit: (v: number) => tn(v) },
    { a: 'A conta de água de uma casa passou', unit: (v: number) => brl(R(v)) },
    { a: 'O público de um estádio passou', unit: (v: number) => tn(v) },
  ]);
  return {
    prompt: `${what.a} de ${m(what.unit(from))} para ${m(what.unit(to))}. Qual foi a variação percentual? (Use o sinal de menos se for uma queda.)`,
    answer: num(R(p)),
    answerText: String(p),
    suffix: '%',
    answerDisplay: m(tp(p)),
    hint: `Variação percentual é ${m('\\frac{\\text{novo} - \\text{antigo}}{\\text{antigo}}')}: compare a mudança com o valor <b>inicial</b>.`,
    steps: [
      `A mudança foi ${m(`${tn(to)} - ${tn(from)} = ${tn(to - from)}`)}.`,
      `Compare com o valor inicial: ${m(`\\frac{${tn(to - from)}}{${tn(from)}} = ${td(R(p, 100))}`)}.`,
      `Em porcentagem: ${m(tp(p))}${p > 0 ? ' (aumento)' : ' (queda)'}.`,
    ],
    keys: ['-', ',', '%'],
    data: { kind: 'pct-taxa', from, to, result: p },
  };
}

// ---------------------------------------------------------------------------
// Variações sucessivas

const sgn = (p: number) => (p > 0 ? `aumento de ${m(tp(p))}` : `desconto de ${m(tp(-p))}`);
const factorOf = (p: number) => R(100 + p, 100);

function successive(rng: Rng, askRate: boolean): Question {
  const pool = askRate ? [10, 20, 30, 40, 50] : [5, 10, 15, 20, 25, 30, 40, 50];
  const p1 = rng.pick(pool) * (rng.chance(0.5) ? 1 : -1);
  const p2 = rng.pick(pool) * (rng.chance(0.5) ? 1 : -1);
  const f1 = factorOf(p1);
  const f2 = factorOf(p2);
  const total = mul(f1, f2);
  const eqRate = mul(sub(total, R(1)), R(100));

  if (askRate) {
    return {
      prompt: `Um produto teve um ${sgn(p1)} e, depois, um ${sgn(p2)}. No total, qual foi a variação percentual do preço? (Use o sinal de menos se for uma queda.)`,
      answer: num(eqRate),
      answerText: px(eqRate),
      suffix: '%',
      answerDisplay: m(tp(eqRate)),
      hint: `Porcentagens sucessivas <b>multiplicam</b>, não somam. Multiplique os fatores ${m(td(f1))} e ${m(td(f2))}.`,
      steps: [
        `Fatores: ${p1 > 0 ? 'aumento' : 'desconto'} de ${m(tp(Math.abs(p1)))} é ${m(`\\times ${td(f1)}`)}; ${p2 > 0 ? 'aumento' : 'desconto'} de ${m(tp(Math.abs(p2)))} é ${m(`\\times ${td(f2)}`)}.`,
        `Os dois juntos: ${m(`${td(f1)} \\cdot ${td(f2)} = ${td(total)}`)}.`,
        `${m(td(total))} é ${m(tp(mul(total, R(100))))} do preço inicial, então a variação total é ${m(tp(eqRate))}${eqRate.n > 0 ? ' (aumento)' : ' (queda)'}.`,
        `Repare: somar daria ${m(tp(p1 + p2))}, que está errado.`,
      ],
      keys: ['-', ',', '%'],
      data: { kind: 'pct-suc-eq', p1, p2, result: px(eqRate) },
    };
  }

  const base = rng.int(2, 30) * 100;
  const mid = mul(R(base), f1);
  const result = mul(mid, f2);
  const thing = rng.pick([
    { s: 'Uma ação da bolsa valia', u: 'valor' },
    { s: 'Um aluguel custava', u: 'valor' },
    { s: 'Uma TV custava', u: 'preço' },
    { s: 'Um investimento tinha', u: 'saldo' },
  ]);
  return {
    prompt: `${thing.s} ${m(brl(R(base)))}. Teve um ${sgn(p1)} e, depois, um ${sgn(p2)}. Qual o ${thing.u} final?`,
    answer: num(result),
    answerText: brlText(result),
    prefix: 'R$',
    answerDisplay: m(brl(result)),
    hint: `Faça uma mudança de cada vez: a segunda porcentagem é calculada sobre o valor <b>já mudado</b>. Fatores: ${m(td(f1))} e ${m(td(f2))}.`,
    steps: [
      `Primeira mudança: ${m(`${tn(base)} \\cdot ${td(f1)} = ${tx(mid)}`)}.`,
      `Segunda mudança, sobre o novo valor: ${m(`${tx(mid)} \\cdot ${td(f2)} = ${tx(result)}`)}.`,
      `Valor final: ${m(brl(result))}. Repare que somar as porcentagens (${m(tp(p1 + p2))}) daria um resultado errado.`,
    ],
    keys: [','],
    data: { kind: 'pct-suc', base, p1, p2, result: px(result) },
  };
}

// ---------------------------------------------------------------------------
// Valor original (conta de trás para frente)

function original(rng: Rng): Question {
  const up = rng.chance(0.4);
  const p = up ? rng.pick([5, 10, 20, 25, 50]) : rng.pick([10, 20, 25, 30, 40, 50]);
  const orig = rng.int(3, 40) * 20;
  const factor = factorOf(up ? p : -p);
  const final = mul(R(orig), factor);
  const prompt = up
    ? `Depois de um aumento de ${m(tp(p))}, a conta de luz de uma casa ficou em ${m(brl(final))}. Quanto era a conta antes do aumento?`
    : `Com ${m(tp(p))} de desconto, ${rng.pick(ITEMS)} saiu por ${m(brl(final))}. Qual era o preço sem desconto?`;
  return {
    prompt,
    answer: num(R(orig)),
    answerText: String(orig),
    prefix: 'R$',
    answerDisplay: m(brl(R(orig))),
    hint: `O valor final é o original vezes ${m(td(factor))}. Para voltar, <b>divida</b> por ${m(td(factor))}. (${up ? 'Tirar' : 'Somar'} ${m(tp(p))} do valor final não funciona!)`,
    steps: [
      `${up ? 'Aumento' : 'Desconto'} de ${m(tp(p))} é multiplicar por ${m(td(factor))}: ${m(`\\text{original} \\cdot ${td(factor)} = ${tx(final)}`)}.`,
      `Fazendo o caminho de volta: ${m(`\\text{original} = ${tx(final)} \\div ${td(factor)} = ${tn(orig)}`)}.`,
      `Conferindo: ${m(`${tn(orig)} \\cdot ${td(factor)} = ${tx(final)}`)}. Resposta: ${m(brl(R(orig)))}.`,
    ],
    keys: [','],
    data: { kind: 'pct-orig', p, up, final: px(final), result: orig },
  };
}

// ---------------------------------------------------------------------------
// Juros simples

function simpleInterest(rng: Rng): Question {
  const c = rng.int(5, 100) * 100;
  const i = rng.int(1, 5);
  const t = rng.int(2, 10);
  const askTotal = rng.chance(0.5);
  const juros = mul(R(c), R(i * t, 100));
  const total = add(R(c), juros);
  const result = askTotal ? total : juros;
  return {
    prompt: `Um empréstimo de ${m(brl(R(c)))} foi feito a juros simples de ${m(tp(i))} ao mês, por ${t} meses. ${askTotal ? 'Qual o valor total a pagar (empréstimo + juros)?' : 'Quanto se paga só de juros?'}`,
    answer: num(result),
    answerText: brlText(result),
    prefix: 'R$',
    answerDisplay: m(brl(result)),
    hint: `Nos juros simples, os juros de cada mês são sempre ${m(tp(i))} do valor inicial. Calcule um mês e multiplique por ${t}.`,
    steps: [
      `Juros de um mês: ${m(`${tp(i)}\\text{ de }${tn(c)} = ${tx(pctOf(i, c))}`)}.`,
      `Em ${t} meses: ${m(`${t} \\cdot ${tx(pctOf(i, c))} = ${tx(juros)}`)}.`,
      askTotal
        ? `Total a pagar: ${m(`${tn(c)} + ${tx(juros)} = ${tx(total)}`)}, ou seja, ${m(brl(total))}.`
        : `Só de juros: ${m(brl(juros))}.`,
    ],
    keys: [','],
    data: { kind: 'pct-juros', c, i, t, askTotal, result: px(result) },
  };
}

// ---------------------------------------------------------------------------
// Comparar ofertas

const SAME = 'As duas saem pelo mesmo preço';

function offers(rng: Rng): Question {
  const pa = rng.int(10, 40) * 10;
  const da = rng.pick([10, 15, 20, 25, 30, 40]);
  const pb = pa + rng.pick([-40, -30, -20, -10, 10, 20, 30, 40, 50]);
  const fixed = rng.chance(0.4);
  const db = fixed ? rng.int(2, 12) * 5 : rng.pick([10, 15, 20, 25, 30, 40, 50]);
  const fa = mul(R(pa), factorOf(-da));
  const fb = fixed ? R(pb - db) : mul(R(pb), factorOf(-db));
  const diff = sub(fa, fb);
  const correct = diff.n === 0 ? SAME : diff.n < 0 ? 'Loja A' : 'Loja B';
  const descB = fixed ? `${m(brl(R(db)))} de desconto` : `${m(tp(db))} de desconto`;
  return {
    prompt: `O mesmo fone de ouvido custa ${m(brl(R(pa)))} na <b>Loja A</b>, com ${m(tp(da))} de desconto, e ${m(brl(R(pb)))} na <b>Loja B</b>, com ${descB}. Qual oferta é mais barata?`,
    answer: choice(rng, correct, ['Loja A', 'Loja B', SAME].filter((o) => o !== correct)),
    answerDisplay: correct,
    hint: 'Não compare só as porcentagens: calcule o preço final em cada loja.',
    steps: [
      `Loja A: ${m(`${tn(pa)} \\cdot ${td(factorOf(-da))} = ${tx(fa)}`)}, ou seja, ${m(brl(fa))}.`,
      fixed
        ? `Loja B: ${m(`${tn(pb)} - ${tn(db)} = ${tx(fb)}`)}, ou seja, ${m(brl(fb))}.`
        : `Loja B: ${m(`${tn(pb)} \\cdot ${td(factorOf(-db))} = ${tx(fb)}`)}, ou seja, ${m(brl(fb))}.`,
      diff.n === 0 ? 'Os preços finais são iguais.' : `A mais barata é a ${correct}, por ${m(brl(R(Math.abs(diff.n), diff.d)))}.`,
    ],
    data: { kind: 'pct-ofertas', a: { price: pa, pct: da }, b: fixed ? { price: pb, off: db } : { price: pb, pct: db }, correct },
  };
}

// ---------------------------------------------------------------------------

const EASY = [10, 20, 25, 50, 5, 1, 75, 30, 40];

const porcentagem: Generator = {
  id: 'porcentagem',
  title: 'Porcentagem',
  generate(level, rng) {
    if (level === 1) {
      if (rng.chance(0.35)) return convert(rng);
      const p = rng.pick(EASY);
      return percentOf(rng, p, niceBase(rng, p, p === 1 ? 2000 : 600), rng.chance(0.4));
    }
    if (level === 2) {
      const kind = rng.pick(['de', 'de', 'var', 'var', 'var', 'qual', 'qual', 'taxa'] as const);
      if (kind === 'var') return change(rng);
      if (kind === 'qual') return partOf(rng);
      if (kind === 'taxa') return rate(rng);
      let p: number;
      do p = rng.int(2, 99);
      while (p % 10 === 0 || p === 25 || p === 75 || p === 50);
      return percentOf(rng, p, niceBase(rng, p, 1500), rng.chance(0.6));
    }
    const kind = rng.pick(['suc', 'suc', 'eq', 'orig', 'orig', 'juros', 'juros', 'ofertas', 'taxa'] as const);
    if (kind === 'suc') return successive(rng, false);
    if (kind === 'eq') return successive(rng, true);
    if (kind === 'orig') return original(rng);
    if (kind === 'juros') return simpleInterest(rng);
    if (kind === 'ofertas') return offers(rng);
    return rate(rng);
  },
};

export default porcentagem;
