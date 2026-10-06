// Potências e raízes: calcular, regras de sinal, expoentes zero e negativos,
// propriedades, notação científica e simplificação de radicais.

import type { Rng } from '@/lib/math/random';
import { R, texFrac } from '@/lib/math/rational';
import type { Generator, Question } from './types';
import { m, M, tn, par, td, intAnswer } from './_util';

/** Potência inteira exata (os sorteios mantêm tudo bem abaixo do limite seguro). */
const ipow = (b: number, e: number) => {
  let r = 1;
  for (let i = 0; i < e; i++) r *= b;
  return r;
};

/** Base em LaTeX, com parênteses quando negativa. */
const texPow = (b: number, e: number | string) => `${par(b)}^{${e}}`;

/** Cadeia "b · b · b" com e fatores. */
const chain = (b: number, e: number) => Array(e).fill(par(b)).join(' \\cdot ');

/** Produtos parciais: 2 → 4 → 8 → 16. */
const partials = (b: number, e: number) => {
  const out: string[] = [];
  for (let i = 1; i <= e; i++) out.push(tn(ipow(b, i)));
  return out.join(' \\to ');
};

const SQUARE_FREE = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19, 21];

// ---------- nível 1 ----------

function power(base: number, exp: number): Question {
  const result = ipow(base, exp);
  const expr = texPow(base, exp);
  const steps = [
    `O expoente ${m(tn(exp))} diz quantas vezes a base ${m(par(base))} aparece multiplicando: ${m(`${expr} = ${chain(base, exp)}`)}.`,
  ];
  if (exp > 2) steps.push(`Multiplicando aos poucos: ${m(partials(base, exp))}.`);
  if (base < 0) steps.push(`Base negativa com expoente ${exp % 2 === 0 ? 'par: os sinais de menos se cancelam aos pares, e o resultado é positivo' : 'ímpar: sobra um sinal de menos, e o resultado é negativo'}.`);
  steps.push(`Resultado: ${m(`${expr} = ${tn(result)}`)}.`);
  return {
    prompt: `Calcule: ${M(expr)}`,
    answer: intAnswer(result),
    answerText: String(result),
    answerDisplay: m(tn(result)),
    hint: `${m(expr)} não é ${m(`${par(base)} \\cdot ${exp}`)}: é a base ${m(par(base))} multiplicada por ela mesma ${exp} vezes.`,
    steps,
    keys: base < 0 ? ['-'] : undefined,
    data: { kind: 'pot-pow', base, exp, result },
  };
}

function powerOf10(rng: Rng): Question {
  const exp = rng.int(2, 9);
  const result = ipow(10, exp);
  return {
    prompt: `Calcule: ${M(`10^{${exp}}`)}`,
    answer: intAnswer(result),
    answerText: String(result),
    answerDisplay: m(tn(result)),
    hint: 'Cada fator 10 acrescenta um zero ao final do número.',
    steps: [
      `${m(`10^{${exp}}`)} é o 10 multiplicado por ele mesmo ${exp} vezes.`,
      `Cada multiplicação por 10 acrescenta um zero: o resultado é 1 seguido de ${exp} zeros.`,
      `Resultado: ${m(`10^{${exp}} = ${tn(result)}`)}.`,
    ],
    data: { kind: 'pot-pow', base: 10, exp, result },
  };
}

function squareRoot(rng: Rng, max: number): Question {
  const root = rng.int(2, max);
  const radicand = root * root;
  return {
    prompt: `Calcule: ${M(`\\sqrt{${tn(radicand)}}`)}`,
    answer: intAnswer(root),
    answerText: String(root),
    answerDisplay: m(tn(root)),
    hint: `Pergunte: que número positivo, multiplicado por ele mesmo, dá ${m(tn(radicand))}?`,
    steps: [
      `A raiz quadrada desfaz o "ao quadrado": procuramos o número positivo que, elevado ao quadrado, dá ${m(tn(radicand))}.`,
      `Como ${m(`${root}^2 = ${root} \\cdot ${root} = ${tn(radicand)}`)}, temos ${m(`\\sqrt{${tn(radicand)}} = ${root}`)}.`,
    ],
    data: { kind: 'pot-root', radicand, index: 2, result: root },
  };
}

const SQUARES = [
  { thing: 'Um azulejo quadrado', unit: 'cm' },
  { thing: 'Uma sala quadrada', unit: 'm' },
  { thing: 'Um terreno quadrado', unit: 'm' },
  { thing: 'Um tabuleiro quadrado', unit: 'cm' },
  { thing: 'Uma horta quadrada', unit: 'm' },
  { thing: 'Uma praça quadrada', unit: 'm' },
];

function squareContext(rng: Rng): Question {
  const { thing, unit } = rng.pick(SQUARES);
  const side = rng.int(3, 25);
  const area = side * side;
  if (rng.chance(0.5)) {
    return {
      prompt: `${thing} tem lado de ${m(`${side}\\text{ ${unit}}`)}. Qual é a área ${thing.includes('quadrada') ? 'dela' : 'dele'}?`,
      answer: intAnswer(area),
      answerText: String(area),
      suffix: `${unit}²`,
      answerDisplay: m(`${tn(area)}\\text{ ${unit}}^2`),
      hint: `A área do quadrado é lado vezes lado, ou seja, o lado ao quadrado: ${m(`${side}^2`)}.`,
      steps: [
        `Área do quadrado = lado ${m('\\times')} lado = ${m('\\text{lado}^2')}.`,
        `${m(`${side}^2 = ${side} \\cdot ${side} = ${tn(area)}`)}.`,
        `A área é ${m(`${tn(area)}\\text{ ${unit}}^2`)}. É por isso que ${m('a^2')} se lê "a ao quadrado".`,
      ],
      data: { kind: 'pot-pow', base: side, exp: 2, result: area },
    };
  }
  return {
    prompt: `${thing} tem área de ${m(`${tn(area)}\\text{ ${unit}}^2`)}. Quanto mede o lado?`,
    answer: intAnswer(side),
    answerText: String(side),
    suffix: unit,
    answerDisplay: m(`${side}\\text{ ${unit}}`),
    hint: `Que número multiplicado por ele mesmo dá ${m(tn(area))}? Isso é ${m(`\\sqrt{${tn(area)}}`)}.`,
    steps: [
      `A área é ${m('\\text{lado}^2')}. Para voltar da área ao lado, tiramos a raiz quadrada: ${m(`\\text{lado} = \\sqrt{${tn(area)}}`)}.`,
      `Como ${m(`${side} \\cdot ${side} = ${tn(area)}`)}, o lado mede ${m(`${side}\\text{ ${unit}}`)}.`,
    ],
    data: { kind: 'pot-root', radicand: area, index: 2, result: side },
  };
}

const CUBES = ['Uma caixa cúbica', 'Um dado gigante', 'Um aquário em forma de cubo', 'Um bloco de gelo cúbico'];

function cubeContext(rng: Rng): Question {
  const side = rng.int(2, 12);
  const vol = side ** 3;
  return {
    prompt: `${rng.pick(CUBES)} tem aresta de ${m(`${side}\\text{ cm}`)}. Qual é o volume?`,
    answer: intAnswer(vol),
    answerText: String(vol),
    suffix: 'cm³',
    answerDisplay: m(`${tn(vol)}\\text{ cm}^3`),
    hint: `O volume do cubo é aresta × aresta × aresta: ${m(`${side}^3`)}.`,
    steps: [
      `Volume do cubo = ${m('\\text{aresta}^3')}: comprimento, largura e altura são iguais.`,
      `${m(`${side}^3 = ${side} \\cdot ${side} \\cdot ${side} = ${tn(side * side)} \\cdot ${side} = ${tn(vol)}`)}.`,
      `O volume é ${m(`${tn(vol)}\\text{ cm}^3`)}. Daí o nome "ao cubo".`,
    ],
    data: { kind: 'pot-pow', base: side, exp: 3, result: vol },
  };
}

// ---------- nível 2 ----------

function zeroExp(rng: Rng): Question {
  const base = rng.pick([rng.int(2, 2026), -rng.int(2, 99)]);
  const expr = texPow(base, 0);
  return {
    prompt: `Calcule: ${M(expr)}`,
    answer: intAnswer(1),
    answerText: '1',
    answerDisplay: m('1'),
    hint: 'Pense no padrão: a cada expoente a menos, dividimos pela base. Qual é o próximo depois de \\(a^1 = a\\)?',
    steps: [
      `Descendo o expoente de 1 em 1, dividimos pela base: ${m(`${texPow(base, 2)} \\div ${par(base)} = ${texPow(base, 1)}`)}, e ${m(`${texPow(base, 1)} \\div ${par(base)} = ${texPow(base, 0)}`)}.`,
      `Mas ${m(`${texPow(base, 1)} \\div ${par(base)} = ${par(base)} \\div ${par(base)} = 1`)}.`,
      `Logo ${m(`${expr} = 1`)}: todo número diferente de zero elevado a zero dá 1.`,
    ],
    data: { kind: 'pot-pow', base, exp: 0, result: 1 },
  };
}

/** −a^n (sem parênteses) ou (−a)^n: a pegadinha do sinal. */
function signTrap(rng: Rng): Question {
  const a = rng.int(2, 9);
  const exp = a <= 3 ? rng.int(2, 4) : rng.int(2, 3);
  const paren = rng.chance(0.5);
  const abs = ipow(a, exp);
  const result = paren ? ipow(-a, exp) : -abs;
  const expr = paren ? `(-${a})^{${exp}}` : `-${a}^{${exp}}`;
  const steps = paren
    ? [
        `Com parênteses, a base é ${m(`-${a}`)}: ${m(`${expr} = ${chain(-a, exp)}`)}.`,
        `${m(`${a}^{${exp}} = ${tn(abs)}`)}, e o expoente ${exp} é ${exp % 2 === 0 ? 'par: os sinais se cancelam e o resultado é positivo' : 'ímpar: sobra um sinal de menos'}.`,
        `Resultado: ${m(`${expr} = ${tn(result)}`)}.`,
      ]
    : [
        `Sem parênteses, o expoente vale só para o ${m(String(a))}. O sinal de menos fica de fora: ${m(`${expr} = -(${a}^{${exp}})`)}.`,
        `${m(`${a}^{${exp}} = ${chain(a, exp)} = ${tn(abs)}`)}.`,
        `Resultado: ${m(`${expr} = ${tn(result)}`)}. Compare: ${m(`(-${a})^{${exp}} = ${tn(ipow(-a, exp))}`)}.`,
      ];
  return {
    prompt: `Calcule (atenção aos parênteses): ${M(expr)}`,
    answer: intAnswer(result),
    answerText: String(result),
    answerDisplay: m(tn(result)),
    hint: paren
      ? `Os parênteses dizem que a base é ${m(`-${a}`)}: multiplique ${m(`(-${a})`)} por ele mesmo ${exp} vezes.`
      : `Sem parênteses, a potência vem antes do sinal: calcule ${m(`${a}^{${exp}}`)} e depois coloque o menos na frente.`,
    steps,
    keys: ['-'],
    data: { kind: 'pot-sign', a, exp, paren, result },
  };
}

/** Expoente negativo: (p/q)^(−n) = (q/p)^n. */
function negativeExp(rng: Rng, hard: boolean): Question {
  let num: number, den: number, n: number;
  if (hard && rng.chance(0.6)) {
    const pairs = [[2, 3], [3, 2], [1, 2], [2, 5], [3, 4], [4, 3], [1, 3], [5, 2], [3, 5]] as const;
    [num, den] = rng.pick(pairs);
    n = rng.int(2, 3);
    if (hard && rng.chance(0.3)) num = -num;
  } else {
    num = rng.int(2, hard ? 10 : 6);
    den = 1;
    n = num <= 3 ? rng.int(1, 5) : num <= 5 ? rng.int(1, 3) : rng.int(1, 2);
    if (n === 1 && rng.chance(0.5)) n = 2;
    if (hard && rng.chance(0.3)) num = -num;
  }
  const base = R(num, den);
  const baseTex = den === 1 ? par(num) : `\\left(${texFrac(base)}\\right)`;
  const inv = R(den, num);
  const invTex = inv.d === 1 ? par(inv.n) : `\\left(${texFrac(inv)}\\right)`;
  const result = R(ipow(den, n), ipow(num, n));
  const expr = `${baseTex}^{-${n}}`;
  return {
    prompt: `Calcule e escreva como fração (ou inteiro): ${M(expr)}`,
    answer: { type: 'number', value: result, requireSimplified: true },
    answerText: result.d === 1 ? String(result.n) : `${result.n}/${result.d}`,
    answerDisplay: m(texFrac(result)),
    hint: `Expoente negativo vira o inverso da base com expoente positivo: ${m(`a^{-n} = \\dfrac{1}{a^n}`)}.`,
    steps: [
      `Expoente negativo significa inverter a base: ${m(`${expr} = ${invTex}^{${n}}`)}.`,
      den === 1
        ? `${m(`${texPow(num, n)} = ${tn(ipow(num, n))}`)}, então ${m(`${expr} = \\dfrac{1}{${tn(ipow(num, n))}}`)}${num < 0 ? ': o sinal de menos pode ir para a frente da fração' : ''}.`
        : `Eleve numerador e denominador: ${m(`${invTex}^{${n}} = \\dfrac{${par(den)}^{${n}}}{${par(num)}^{${n}}}`)}.`,
      `Resultado: ${m(`${expr} = ${texFrac(result)}`)}.`,
    ],
    keys: ['-', '/'],
    data: { kind: 'pot-neg', num, den, n, result: [result.n, result.d] },
  };
}

type PropForm = 'mul' | 'div' | 'pow' | 'mix';

/** Propriedades: pergunta o expoente final. */
function property(rng: Rng, hard: boolean): Question {
  const base = hard ? rng.pick([2, 3, 5, 7, 10, 'a', 'x'] as const) : rng.int(2, 9);
  const b = String(base);
  const form: PropForm = hard ? rng.pick(['mul', 'div', 'pow', 'mix'] as const) : rng.pick(['mul', 'mul', 'div', 'pow'] as const);
  const lo = hard ? 5 : 2;
  const hi = hard ? 40 : 9;
  let exps: number[];
  let expr: string, rule: string, calc: string, result: number;
  if (form === 'mul') {
    exps = [rng.int(lo, hi), rng.int(lo, hi)];
    result = exps[0] + exps[1];
    expr = `${b}^{${exps[0]}} \\cdot ${b}^{${exps[1]}}`;
    rule = 'Multiplicação de mesma base: conserve a base e <b>some</b> os expoentes.';
    calc = `${exps[0]} + ${exps[1]} = ${result}`;
  } else if (form === 'div') {
    const small = rng.int(lo, hi);
    exps = [small + rng.int(1, hi), small];
    result = exps[0] - exps[1];
    expr = `${b}^{${exps[0]}} \\div ${b}^{${exps[1]}}`;
    rule = 'Divisão de mesma base: conserve a base e <b>subtraia</b> os expoentes.';
    calc = `${exps[0]} - ${exps[1]} = ${result}`;
  } else if (form === 'pow') {
    exps = [rng.int(2, hard ? 12 : 5), rng.int(2, hard ? 9 : 4)];
    result = exps[0] * exps[1];
    expr = `\\left(${b}^{${exps[0]}}\\right)^{${exps[1]}}`;
    rule = 'Potência de potência: conserve a base e <b>multiplique</b> os expoentes.';
    calc = `${exps[0]} \\cdot ${exps[1]} = ${result}`;
  } else {
    exps = [rng.int(3, 20), rng.int(3, 20)];
    exps.push(rng.int(2, Math.min(25, exps[0] + exps[1] - 1)));
    result = exps[0] + exps[1] - exps[2];
    expr = `\\dfrac{${b}^{${exps[0]}} \\cdot ${b}^{${exps[1]}}}{${b}^{${exps[2]}}}`;
    rule = 'No numerador, some os expoentes; na divisão pelo denominador, subtraia.';
    calc = `${exps[0]} + ${exps[1]} - ${exps[2]} = ${result}`;
  }
  const why =
    form === 'mul'
      ? `Isso porque são ${exps[0]} fatores ${m(b)} seguidos de mais ${exps[1]}: ao todo, ${result} fatores.`
      : form === 'div'
        ? `Na fração, ${exps[1]} fatores ${m(b)} de cima cancelam com os ${exps[1]} de baixo e sobram ${result}.`
        : form === 'pow'
          ? `Isso porque ${m(`${b}^{${exps[0]}}`)} aparece ${exps[1]} vezes multiplicando: ${exps[1]} grupos de ${exps[0]} fatores.`
          : `Em cima ficam ${m(`${b}^{${exps[0] + exps[1]}}`)}; dividindo por ${m(`${b}^{${exps[2]}}`)}, sobram ${result} fatores.`;
  return {
    prompt: `Escreva como uma só potência e responda o expoente: ${M(`${expr} = ${b}^{\\,?}`)}`,
    answer: intAnswer(result),
    answerText: String(result),
    placeholder: 'Expoente',
    answerDisplay: m(`${b}^{${result}}`),
    hint: form === 'mul' ? 'Mesma base multiplicando: some os expoentes.' : form === 'div' ? 'Mesma base dividindo: subtraia os expoentes.' : form === 'pow' ? 'Potência de potência: multiplique os expoentes.' : 'Primeiro junte o numerador (somando), depois divida (subtraindo).',
    steps: [rule, why, `Expoente: ${m(calc)}. Logo ${m(`${expr} = ${b}^{${result}}`)}.`],
    data: { kind: 'pot-prop', form, exps, result, base: typeof base === 'number' ? base : null },
  };
}

function cubeRoot(rng: Rng, allowNeg: boolean): Question {
  let root = rng.int(2, 10);
  if (allowNeg && rng.chance(0.3)) root = -root;
  const radicand = root ** 3;
  return {
    prompt: `Calcule: ${M(`\\sqrt[3]{${tn(radicand)}}`)}`,
    answer: intAnswer(root),
    answerText: String(root),
    answerDisplay: m(tn(root)),
    hint: `Que número, multiplicado por ele mesmo três vezes, dá ${m(tn(radicand))}?`,
    steps: [
      `A raiz cúbica desfaz o "ao cubo": procuramos ${m('x')} com ${m(`x^3 = ${tn(radicand)}`)}.`,
      `${m(`${chain(root, 3)} = ${tn(radicand)}`)}${root < 0 ? ' (expoente ímpar mantém o sinal de menos)' : ''}.`,
      `Logo ${m(`\\sqrt[3]{${tn(radicand)}} = ${tn(root)}`)}.`,
    ],
    keys: allowNeg ? ['-'] : undefined,
    data: { kind: 'pot-root', radicand, index: 3, result: root },
  };
}

/** Notação científica: pergunta o expoente de 10. */
function scientific(rng: Rng, small: boolean): Question {
  // mantissa com uma casa decimal (em décimos): 1,0 a 9,9
  const tenths = rng.int(10, 99);
  const mant = R(tenths, 10);
  const exp = small ? -rng.int(2, 7) : rng.int(3, 11);
  const value = exp > 0 ? R(tenths * ipow(10, exp - 1)) : R(tenths, ipow(10, 1 - exp));
  const valTex = exp > 0 ? tn(value.n) : td(value);
  const mTex = td(mant);
  const moves = Math.abs(exp);
  return {
    prompt: `Complete a notação científica com o expoente de 10: ${M(`${valTex} = ${mTex} \\times 10^{\\,?}`)}`,
    answer: intAnswer(exp),
    answerText: String(exp),
    placeholder: 'Expoente',
    answerDisplay: m(`${valTex} = ${mTex} \\times 10^{${exp}}`),
    hint: small
      ? 'Conte quantas casas a vírgula anda para a direita até ficar um só algarismo (não zero) antes dela. Número pequeno → expoente negativo.'
      : 'Conte quantas casas a vírgula anda para a esquerda até ficar um só algarismo antes dela.',
    steps: [
      `Na notação científica, o número fica entre 1 e 10 vezes uma potência de 10. Aqui esse número é ${m(mTex)}.`,
      small
        ? `Para ir de ${m(valTex)} até ${m(mTex)}, a vírgula anda ${moves} casas para a <b>direita</b>. Isso é multiplicar por ${m(`10^{${moves}}`)}, então para compensar usamos ${m(`10^{${exp}}`)}.`
        : `Para ir de ${m(valTex)} até ${m(mTex)}, a vírgula anda ${moves} casas para a <b>esquerda</b>: dividimos por ${m(`10^{${moves}}`)}, então para compensar multiplicamos por ${m(`10^{${exp}}`)}.`,
      `Resultado: ${m(`${valTex} = ${mTex} \\times 10^{${exp}}`)}.`,
    ],
    keys: small ? ['-'] : undefined,
    data: { kind: 'pot-sci', value: [value.n, value.d], mant: [mant.n, mant.d], exp },
  };
}

// ---------- nível 3 ----------

/** Simplificar √(k²·r) = k√r, montado de trás para frente. */
function simplifyRadical(rng: Rng): Question {
  let k: number, r: number;
  do {
    k = rng.int(2, 12);
    r = rng.pick(SQUARE_FREE);
  } while (k * k * r > 1500);
  const radicand = k * k * r;
  const sq = k * k;
  return {
    prompt: `Simplifique o radical, tirando da raiz tudo o que for possível: ${M(`\\sqrt{${tn(radicand)}}`)}`,
    answer: { type: 'radical', coef: k, rad: r },
    answerText: `${k}√${r}`,
    answerDisplay: m(`${k}\\sqrt{${r}}`),
    placeholder: 'ex.: 3√2',
    hint: `Procure o maior quadrado perfeito (4, 9, 16, 25, 36, ...) que divide ${m(tn(radicand))}.`,
    steps: [
      `Procure o maior quadrado perfeito que divide ${m(tn(radicand))}: é ${m(`${tn(sq)} = ${k}^2`)}, e ${m(`${tn(radicand)} = ${tn(sq)} \\cdot ${r}`)}.`,
      `A raiz de um produto é o produto das raízes: ${m(`\\sqrt{${tn(radicand)}} = \\sqrt{${tn(sq)}} \\cdot \\sqrt{${r}} = ${k}\\sqrt{${r}}`)}.`,
      `O ${m(String(r))} não tem mais nenhum fator quadrado, então a forma mais simples é ${m(`${k}\\sqrt{${r}}`)}.`,
    ],
    keys: ['√'],
    data: { kind: 'pot-rad', radicand, coef: k, rad: r },
  };
}

type Term = { sign: 1 | -1; type: 'pow'; base: number; exp: number } | { sign: 1 | -1; type: 'root'; radicand: number; index: number };

/** Expressão misturando potências e raízes: 2³ + √81 − 4⁰. */
function mixed(rng: Rng): Question {
  const b1 = rng.int(2, 6);
  const t1: Term = { sign: 1, type: 'pow', base: b1, exp: b1 <= 3 ? rng.int(2, 5) : rng.int(2, 3) };
  const cube = rng.chance(0.3);
  const r2 = cube ? rng.int(2, 6) : rng.int(2, 15);
  const t2: Term = { sign: rng.pick([1, -1] as const), type: 'root', radicand: cube ? r2 ** 3 : r2 * r2, index: cube ? 3 : 2 };
  const t3: Term = { sign: rng.pick([1, -1] as const), type: 'pow', base: rng.pick([rng.int(2, 9), -rng.int(2, 5)]), exp: rng.int(0, 2) };
  const terms = rng.chance(0.5) ? [t1, t2, t3] : [t2.sign === 1 ? t2 : { ...t2, sign: 1 as const }, { ...t1, sign: t2.sign }, t3];

  const texOf = (t: Term) => (t.type === 'pow' ? texPow(t.base, t.exp) : t.index === 2 ? `\\sqrt{${tn(t.radicand)}}` : `\\sqrt[3]{${tn(t.radicand)}}`);
  const valOf = (t: Term) => (t.type === 'pow' ? ipow(t.base, t.exp) : t.index === 2 ? Math.round(Math.sqrt(t.radicand)) : Math.round(Math.cbrt(t.radicand)));
  const join = (parts: string[]) => parts.map((p, i) => (i === 0 ? p : `${terms[i].sign < 0 ? '-' : '+'} ${p}`)).join(' ');
  const expr = join(terms.map(texOf));
  const vals = terms.map(valOf);
  const result = terms.reduce((s, t, i) => s + t.sign * vals[i], 0);
  return {
    prompt: `Calcule: ${M(expr)}`,
    answer: intAnswer(result),
    answerText: String(result),
    answerDisplay: m(tn(result)),
    hint: 'Primeiro resolva cada potência e cada raiz separadamente; só depois some e subtraia.',
    steps: [
      `Potências e raízes vêm antes da soma e da subtração. Calcule cada parte: ${terms.map((t, i) => m(`${texOf(t)} = ${tn(vals[i])}`)).join(', ')}.`,
      `Substituindo: ${m(join(vals.map(par)))}.`,
      `Resultado: ${m(tn(result))}.`,
    ],
    keys: ['-'],
    data: { kind: 'pot-expr', terms, result },
  };
}

/** Entre quais inteiros consecutivos está √n. */
function between(rng: Rng): Question {
  const k = rng.int(2, 30);
  const n = rng.int(k * k + 1, (k + 1) * (k + 1) - 1);
  return {
    prompt: `${m(`\\sqrt{${tn(n)}}`)} não é inteira. Entre quais dois inteiros consecutivos ela está?`,
    answer: {
      type: 'fields',
      fields: [
        { label: 'Menor inteiro', value: R(k) },
        { label: 'Maior inteiro', value: R(k + 1) },
      ],
    },
    answerText: `${k};${k + 1}`,
    answerDisplay: m(`${k} < \\sqrt{${tn(n)}} < ${k + 1}`),
    hint: `Procure os quadrados perfeitos vizinhos de ${m(tn(n))}: um logo abaixo e um logo acima.`,
    steps: [
      `Liste quadrados perto de ${m(tn(n))}: ${m(`${k}^2 = ${tn(k * k)}`)} e ${m(`${k + 1}^2 = ${tn((k + 1) * (k + 1))}`)}.`,
      `Como ${m(`${tn(k * k)} < ${tn(n)} < ${tn((k + 1) * (k + 1))}`)}, tirando a raiz de tudo: ${m(`${k} < \\sqrt{${tn(n)}} < ${k + 1}`)}.`,
    ],
    data: { kind: 'pot-between', n, lo: k, hi: k + 1 },
  };
}

const potencias: Generator = {
  id: 'potencias',
  title: 'Potências e raízes',
  generate(level, rng) {
    if (level === 1) {
      const kind = rng.pick(['pow', 'pow', 'pow10', 'sqrt', 'sqrt', 'square', 'square', 'cube'] as const);
      if (kind === 'pow10') return powerOf10(rng);
      if (kind === 'sqrt') return squareRoot(rng, 20);
      if (kind === 'square') return squareContext(rng);
      if (kind === 'cube') return cubeContext(rng);
      const base = rng.chance(0.2) ? -rng.int(2, 4) : rng.int(2, 9);
      const a = Math.abs(base);
      const exp = a === 2 ? rng.int(2, 7) : a === 3 ? rng.int(2, 5) : a <= 5 ? rng.int(2, 4) : rng.int(2, 3);
      return power(base, exp);
    }
    if (level === 2) {
      const kind = rng.pick(['zero', 'sign', 'sign', 'neg', 'neg', 'prop', 'prop', 'cbrt', 'sci'] as const);
      if (kind === 'zero') return zeroExp(rng);
      if (kind === 'sign') return signTrap(rng);
      if (kind === 'neg') return negativeExp(rng, false);
      if (kind === 'prop') return property(rng, false);
      if (kind === 'cbrt') return cubeRoot(rng, false);
      return scientific(rng, false);
    }
    const kind = rng.pick(['rad', 'rad', 'rad', 'expr', 'expr', 'prop', 'between', 'between', 'neg', 'sci', 'cbrt'] as const);
    if (kind === 'rad') return simplifyRadical(rng);
    if (kind === 'expr') return mixed(rng);
    if (kind === 'prop') return property(rng, true);
    if (kind === 'between') return between(rng);
    if (kind === 'neg') return negativeExp(rng, true);
    if (kind === 'cbrt') return cubeRoot(rng, true);
    return scientific(rng, true);
  },
};

export default potencias;
