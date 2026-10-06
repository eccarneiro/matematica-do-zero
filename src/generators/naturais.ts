// Números naturais: contar, sucessor e antecessor, ℕ e ℕ*, quantos números há num intervalo.

import type { Rng } from '@/lib/math/random';
import type { Generator, Question } from './types';
import { m, tn, pn, intAnswer, choice } from './_util';

/** Figura: riscos de contagem agrupados de 5 em 5 (o quinto risco corta os outros quatro). */
export function tallySvg(n: number): string {
  const groups = Math.floor(n / 5);
  const rest = n % 5;
  const perRow = 6;
  const gw = 46; // largura de um grupo
  const rows = Math.ceil((groups + (rest ? 1 : 0)) / perRow);
  let g = '';
  let idx = 0;
  const place = (i: number) => ({ x: 10 + (i % perRow) * (gw + 8), y: 10 + Math.floor(i / perRow) * 54 });
  for (let k = 0; k < groups; k++, idx++) {
    const { x, y } = place(idx);
    for (let j = 0; j < 4; j++) g += `<line x1="${x + 6 + j * 9}" y1="${y}" x2="${x + 6 + j * 9}" y2="${y + 40}" class="s-ink" stroke-width="3" stroke-linecap="round"/>`;
    g += `<line x1="${x}" y1="${y + 34}" x2="${x + 40}" y2="${y + 6}" class="s-acc" stroke-width="3" stroke-linecap="round"/>`;
  }
  if (rest) {
    const { x, y } = place(idx);
    for (let j = 0; j < rest; j++) g += `<line x1="${x + 6 + j * 9}" y1="${y}" x2="${x + 6 + j * 9}" y2="${y + 40}" class="s-ink" stroke-width="3" stroke-linecap="round"/>`;
  }
  const w = 20 + Math.min(perRow, groups + (rest ? 1 : 0)) * (gw + 8);
  return `<svg viewBox="0 0 ${Math.max(w, 120)} ${rows * 54 + 8}" role="img" aria-label="Riscos de contagem agrupados de cinco em cinco">${g}</svg>`;
}

function count(rng: Rng, level: number): Question {
  const n = level === 1 ? rng.int(3, 14) : level === 2 ? rng.int(15, 34) : rng.int(35, 58);
  const groups = Math.floor(n / 5);
  const rest = n % 5;
  return {
    prompt: 'Quantos riscos há na figura? (Cada feixe cortado tem 5.)',
    figure: tallySvg(n),
    answer: intAnswer(n),
    answerText: pn(n),
    answerDisplay: m(tn(n)),
    hint: 'Conte os feixes de 5 primeiro e depois os riscos soltos.',
    steps: [
      `Há ${groups} ${groups === 1 ? 'feixe' : 'feixes'} de 5: ${m(`${groups} \\cdot 5 = ${groups * 5}`)}.`,
      `Mais ${rest} ${rest === 1 ? 'risco solto' : 'riscos soltos'}: ${m(`${groups * 5} + ${rest} = ${n}`)}.`,
    ],
    data: { kind: 'nat-contar', groups, rest, result: n },
  };
}

function successor(rng: Rng, level: number): Question {
  const max = level === 1 ? 50 : level === 2 ? 10_000 : 1_000_000;
  const n = rng.int(level === 1 ? 1 : 100, max);
  // Em níveis maiores, números "redondos" deixam o sucessor/antecessor mais interessante (999 → 1000).
  const base = level >= 2 && rng.chance(0.5) ? Math.round(n / 1000) * 1000 + rng.pick([-1, 0, 1]) : n;
  const value = Math.max(1, base);
  const prev = rng.chance(0.5);
  const result = prev ? value - 1 : value + 1;
  return {
    prompt: `Qual é o <b>${prev ? 'antecessor' : 'sucessor'}</b> de ${m(tn(value))}?`,
    answer: intAnswer(result),
    answerText: pn(result),
    answerDisplay: m(tn(result)),
    hint: prev ? 'O antecessor é o número que vem logo antes: tire 1.' : 'O sucessor é o número que vem logo depois: some 1.',
    steps: [`${prev ? 'Antecessor' : 'Sucessor'} de ${m(tn(value))}: ${m(`${tn(value)} ${prev ? '-' : '+'} 1 = ${tn(result)}`)}.`],
    data: { kind: 'nat-sucessor', n: value, prev, result },
  };
}

function belongs(rng: Rng): Question {
  const cases = [
    { v: '0', inN: true, inNstar: false, why: 'Pela convenção atual, o 0 é natural; mas o $\\mathbb{N}^*$ é justamente a lista sem o zero.' },
    { v: String(rng.int(1, 999)), inN: true, inNstar: true, why: 'Números de contar positivos estão nas duas listas.' },
    { v: `-${rng.int(1, 50)}`, inN: false, inNstar: false, why: 'Negativos não são naturais: eles são inteiros.' },
    { v: `${rng.int(1, 9)},5`, inN: false, inNstar: false, why: 'Números com vírgula não servem para contar coisas inteiras.' },
  ];
  const c = rng.pick(cases);
  const set = rng.pick(['N', 'Nstar'] as const);
  const yes = set === 'N' ? c.inN : c.inNstar;
  const setTex = set === 'N' ? '\\mathbb{N}' : '\\mathbb{N}^*';
  const vTex = c.v.replace(',', '{,}').replace('-', '-');
  return {
    prompt: `O número ${m(vTex)} pertence a ${m(setTex)}?`,
    answer: choice(rng, yes ? 'Sim' : 'Não', [yes ? 'Não' : 'Sim']),
    answerDisplay: yes ? 'Sim' : 'Não',
    hint: `Lembre: ${m('\\mathbb{N} = \\{0, 1, 2, \\dots\\}')} e ${m('\\mathbb{N}^* = \\{1, 2, 3, \\dots\\}')}.`,
    steps: [c.why.replace(/\$(.+?)\$/g, (_, t) => m(t)), `Resposta: ${yes ? 'pertence' : 'não pertence'} a ${m(setTex)}.`],
    data: { kind: 'nat-conjunto', value: c.v, set, result: yes },
  };
}

function between(rng: Rng, level: number): Question {
  const a = rng.int(level === 2 ? 1 : 10, level === 2 ? 30 : 400);
  const b = a + rng.int(5, level === 2 ? 40 : 600);
  const result = b - a + 1;
  return {
    prompt: `Quantos números naturais há de ${m(tn(a))} até ${m(tn(b))}, contando os dois?`,
    answer: intAnswer(result),
    answerText: pn(result),
    answerDisplay: m(tn(result)),
    hint: 'Cuidado com o "erro da cerca": de 1 até 5 há 5 números, mas 5 − 1 = 4. Some 1 no final.',
    steps: [
      `A diferença ${m(`${tn(b)} - ${tn(a)} = ${tn(b - a)}`)} conta os "pulos" entre eles.`,
      `Como os dois extremos entram, some 1: ${m(`${tn(b - a)} + 1 = ${tn(result)}`)}.`,
    ],
    data: { kind: 'nat-intervalo', a, b, result },
  };
}

const naturais: Generator = {
  id: 'naturais',
  title: 'Números naturais',
  generate(level, rng) {
    const kind =
      level === 1
        ? rng.pick(['contar', 'contar', 'sucessor', 'sucessor', 'conjunto'] as const)
        : rng.pick(['contar', 'sucessor', 'conjunto', 'intervalo', 'intervalo'] as const);
    if (kind === 'contar') return count(rng, level);
    if (kind === 'sucessor') return successor(rng, level);
    if (kind === 'conjunto') return belongs(rng);
    return between(rng, level);
  },
};

export default naturais;
