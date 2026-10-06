// Frações: ler figuras, fração de quantidade, simplificar, comparar e operar.

import type { ExpectedAnswer } from '@/lib/math/answer';
import type { Rng } from '@/lib/math/random';
import { R, add, sub, mul, div, gcd, lcm, type Rational } from '@/lib/math/rational';
import type { Generator, Question } from './types';
import { m, M, tn, tr, intAnswer, choice } from './_util';

/** Fração em LaTeX exatamente como escrita (sem simplificar). */
const f = (n: number | string, d: number | string) => `\\frac{${n}}{${d}}`;
const fr = (a: Rational) => tr(a);
const mmc = (a: number, b: number) => `\\text{mmc}(${a}, ${b})`;

/** Resposta em fração, exigindo a forma mais simples. */
const fracAnswer = (a: Rational): ExpectedAnswer => ({ type: 'number', value: a, requireSimplified: true });
const typed = (a: Rational) => (a.d === 1 ? String(a.n) : `${a.n}/${a.d}`);

/** Fração própria irredutível com denominador em [dMin, dMax]. */
function properFrac(rng: Rng, dMin: number, dMax: number): Rational {
  let n: number, d: number;
  do {
    d = rng.int(dMin, dMax);
    n = rng.int(1, d - 1);
  } while (gcd(n, d) !== 1);
  return R(n, d);
}

/** Passo de simplificação de n/d (vazio se já é irredutível). */
function simplifySteps(n: number, d: number): string[] {
  const g = gcd(n, d);
  const out: string[] = [];
  if (g > 1) {
    out.push(`Simplifique dividindo em cima e embaixo por ${g}: ${m(`${f(n, d)} = ${f(n / g, d / g)}${d / g === 1 ? ` = ${n / g}` : ''}`)}.`);
  }
  const r = R(n, d);
  if (r.d > 1 && r.n > r.d) {
    const w = Math.floor(r.n / r.d);
    out.push(`Se quiser, escreva como número misto: ${m(`${fr(r)} = ${w}\\,${f(r.n - w * r.d, r.d)}`)}.`);
  }
  return out;
}

// ---------- Figuras (SVG puro, com classes do tema) ----------

const SVG = 'xmlns="http://www.w3.org/2000/svg" role="img"';
const part = (on: boolean) => `data-part="1" data-painted="${on ? 1 : 0}" class="${on ? 'f-acc' : 'f-surface2'} s-ink" stroke-width="2.5" stroke-linejoin="round"`;

export function pizzaSvg(painted: boolean[]): string {
  const n = painted.length;
  const k = painted.filter(Boolean).length;
  const [cx, cy, r] = [150, 92, 82];
  const pt = (i: number) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  };
  const slices =
    n === 1
      ? `<circle cx="${cx}" cy="${cy}" r="${r}" ${part(painted[0])}/>`
      : painted.map((on, i) => `<path d="M${cx} ${cy} L${pt(i)} A${r} ${r} 0 0 1 ${pt(i + 1)} Z" ${part(on)}/>`).join('');
  return `<svg ${SVG} viewBox="0 0 300 184" aria-label="Pizza dividida em ${n} partes iguais, com ${k} pintadas">${slices}</svg>`;
}

export function barSvg(painted: boolean[]): string {
  const n = painted.length;
  const k = painted.filter(Boolean).length;
  const w = 296 / n;
  const cells = painted.map((on, i) => `<rect x="${(2 + i * w).toFixed(2)}" y="2" width="${w.toFixed(2)}" height="66" ${part(on)}/>`).join('');
  return `<svg ${SVG} viewBox="0 0 300 70" aria-label="Barra dividida em ${n} partes iguais, com ${k} pintadas">${cells}</svg>`;
}

// ---------- Questões ----------

function figure(rng: Rng): Question {
  const shape = rng.pick(['pizza', 'barra'] as const);
  const n = rng.int(2, shape === 'pizza' ? 10 : 12);
  const k = rng.int(1, n - 1);
  // Pedaços pintados juntos ou espalhados (para obrigar a contar).
  let painted = Array.from({ length: n }, (_, i) => i < k);
  if (rng.chance(0.4)) painted = rng.shuffle(painted);
  const g = gcd(k, n);
  const steps = [
    `A ${shape} está dividida em ${n} partes iguais: esse é o <b>denominador</b>, ${m(tn(n))}.`,
    `Há ${k} ${k === 1 ? 'parte pintada' : 'partes pintadas'}: esse é o <b>numerador</b>, ${m(tn(k))}.`,
    `A fração pintada é ${m(f(k, n))}.`,
  ];
  if (g > 1) steps.push(`Ela é equivalente a ${m(`${f(k, n)} = ${f(k / g, n / g)}`)} (as duas respostas valem).`);
  return {
    prompt: `Que fração da ${shape} está pintada?`,
    figure: shape === 'pizza' ? pizzaSvg(painted) : barSvg(painted),
    answer: { type: 'number', value: R(k, n) },
    answerText: `${k}/${n}`,
    answerDisplay: m(f(k, n)),
    hint: 'Conte em quantas partes iguais o todo foi dividido (vai embaixo) e quantas estão pintadas (vai em cima).',
    steps,
    keys: ['/'],
    placeholder: 'ex.: 3/4',
    data: { kind: 'frac-figura', n, k },
  };
}

const QUANTITIES: ((fr: string, t: number) => string)[] = [
  (fr, t) => `Um pacote tem ${t} balas. Você come ${fr} delas. Quantas balas você come?`,
  (fr, t) => `Uma turma tem ${t} alunos, e ${fr} deles vão de ônibus para a escola. Quantos alunos vão de ônibus?`,
  (fr, t) => `Um treino dura ${t} minutos, e ${fr} desse tempo é aquecimento. Quantos minutos dura o aquecimento?`,
  (fr, t) => `Você tinha ${t} reais e gastou ${fr} deles num lanche. Quantos reais você gastou?`,
];

function ofQuantity(rng: Rng, dMax: number, qMax: number): Question {
  const d = rng.int(2, dMax);
  const n = rng.int(1, d - 1);
  const each = rng.int(2, qMax);
  const total = d * each;
  const result = n * each;
  const prompt = rng.chance(0.5)
    ? rng.pick(QUANTITIES)(m(f(n, d)), total)
    : `Calcule: ${M(`${f(n, d)} \\text{ de } ${tn(total)}`)}`;
  return {
    prompt,
    answer: intAnswer(result),
    answerText: String(result),
    answerDisplay: m(tn(result)),
    hint: `Divida ${total} em ${d} partes iguais e pegue ${n} ${n === 1 ? 'delas' : 'dessas partes'}.`,
    steps: [
      `O denominador ${d} diz para dividir o total em ${d} partes iguais: ${m(`${tn(total)} \\div ${d} = ${each}`)}.`,
      `O numerador ${n} diz quantas partes pegar: ${m(`${n} \\cdot ${each} = ${tn(result)}`)}.`,
      `Logo, ${m(`${f(n, d)} \\text{ de } ${tn(total)} = ${tn(result)}`)}.`,
    ],
    data: { kind: 'frac-quantidade', n, d, total, result },
  };
}

function simplify(rng: Rng): Question {
  const base = properFrac(rng, 2, 12);
  const k = rng.int(2, 9);
  const [n, d] = [base.n * k, base.d * k];
  return {
    prompt: `Simplifique ao máximo a fração ${M(f(n, d))}`,
    answer: fracAnswer(base),
    answerText: typed(base),
    answerDisplay: m(fr(base)),
    hint: 'Procure um número que divida o numerador e o denominador ao mesmo tempo. Repita até não dar mais.',
    steps: [
      `O maior número que divide ${n} e ${d} ao mesmo tempo é ${k} (o mdc).`,
      `Dividindo os dois por ${k}: ${m(`${f(n, d)} = ${f(`${n} \\div ${k}`, `${d} \\div ${k}`)} = ${fr(base)}`)}.`,
      `Não dá para simplificar mais: ${base.n} e ${base.d} não têm divisor comum além do 1.`,
    ],
    keys: ['/'],
    placeholder: 'ex.: 2/3',
    data: { kind: 'frac-simplificar', n, d },
  };
}

/** Soma ou subtração de duas frações (resultado nunca negativo nem zero). */
function addSub(rng: Rng, sameDen: boolean): Question {
  // Frações guardadas como foram escritas (numerador, denominador).
  let a: [number, number], b: [number, number];
  const op = rng.chance(0.5) ? '+' : '-';
  do {
    if (sameDen) {
      const d = rng.int(3, 12);
      a = [rng.int(1, d - 1), d];
      b = [rng.int(1, d - 1), d];
    } else {
      const x = properFrac(rng, 2, 8);
      const y = properFrac(rng, 2, 8);
      a = [x.n, x.d];
      b = [y.n, y.d];
    }
  } while ((!sameDen && a[1] === b[1]) || a[0] * b[1] === b[0] * a[1]);
  if (op === '-' && a[0] * b[1] < b[0] * a[1]) [a, b] = [b, a];
  const result = op === '+' ? add(R(...a), R(...b)) : sub(R(...a), R(...b));
  const expr = `${f(...a)} ${op} ${f(...b)}`;
  const steps: string[] = [];
  let N: number, D: number;
  if (a[1] === b[1]) {
    D = a[1];
    N = op === '+' ? a[0] + b[0] : a[0] - b[0];
    steps.push(`Os denominadores são iguais: os pedaços têm o mesmo tamanho. Mantenha o ${D} e ${op === '+' ? 'some' : 'subtraia'} os numeradores: ${m(`${expr} = ${f(N, D)}`)}.`);
  } else {
    D = lcm(a[1], b[1]);
    const [na, nb] = [a[0] * (D / a[1]), b[0] * (D / b[1])];
    N = op === '+' ? na + nb : na - nb;
    steps.push(`Os denominadores são diferentes, então os pedaços têm tamanhos diferentes. Procure um denominador comum: ${m(`${mmc(a[1], b[1])} = ${D}`)}.`);
    steps.push(`Reescreva as frações com denominador ${D}: ${m(`${f(...a)} = ${f(na, D)}`)} e ${m(`${f(...b)} = ${f(nb, D)}`)}.`);
    steps.push(`Agora ${op === '+' ? 'some' : 'subtraia'} os numeradores: ${m(`${f(na, D)} ${op} ${f(nb, D)} = ${f(N, D)}`)}.`);
  }
  steps.push(...simplifySteps(N, D));
  steps.push(`Resultado: ${m(`${expr} = ${fr(result)}`)}.`);
  return {
    prompt: `Calcule e dê a resposta na forma mais simples: ${M(expr)}`,
    answer: fracAnswer(result),
    answerText: typed(result),
    answerDisplay: m(fr(result)),
    hint:
      a[1] === b[1]
        ? 'Com denominadores iguais, mantenha o denominador e opere só os numeradores.'
        : `Antes de ${op === '+' ? 'somar' : 'subtrair'}, deixe as frações com o mesmo denominador (use o mmc de ${a[1]} e ${b[1]}).`,
    steps,
    keys: ['/'],
    data: { kind: 'frac-soma', a, b, op },
  };
}

function equivalent(rng: Rng): Question {
  const base = properFrac(rng, 2, 9);
  const k = rng.int(2, 8);
  const missing = rng.pick(['num', 'den'] as const);
  const [n2, d2] = [base.n * k, base.d * k];
  const answer = missing === 'num' ? n2 : d2;
  const shown = missing === 'num' ? f('?', d2) : f(n2, '?');
  const known = missing === 'num' ? `${base.d} \\cdot ${k} = ${d2}` : `${base.n} \\cdot ${k} = ${n2}`;
  return {
    prompt: `Complete com o número que falta para as frações serem equivalentes: ${M(`${f(base.n, base.d)} = ${shown}`)}`,
    answer: intAnswer(answer),
    answerText: String(answer),
    answerDisplay: m(tn(answer)),
    hint: 'Frações equivalentes: o que foi feito embaixo tem que ser feito em cima (e vice-versa).',
    steps: [
      `Veja o que aconteceu com o ${missing === 'num' ? 'denominador' : 'numerador'}: ${m(known)}. Ele foi multiplicado por ${k}.`,
      `Faça o mesmo com o ${missing === 'num' ? 'numerador' : 'denominador'}: ${m(missing === 'num' ? `${base.n} \\cdot ${k} = ${n2}` : `${base.d} \\cdot ${k} = ${d2}`)}.`,
      `Logo, ${m(`${f(base.n, base.d)} = ${f(n2, d2)}`)}: cada pedaço foi cortado em ${k}.`,
    ],
    data: { kind: 'frac-equivalente', n: base.n, d: base.d, n2, d2, missing, result: answer },
  };
}

/** Número misto para fração imprópria: 2 3/4 = ?/4. */
function mixed(rng: Rng): Question {
  const fr0 = properFrac(rng, 2, 9);
  const w = rng.int(1, 6);
  const result = w * fr0.d + fr0.n;
  return {
    prompt: `Complete: ${M(`${w}\\,${f(fr0.n, fr0.d)} = ${f('?', fr0.d)}`)}`,
    answer: intAnswer(result),
    answerText: String(result),
    answerDisplay: m(tn(result)),
    hint: `Cada inteiro tem ${fr0.d} pedaços de ${m(f(1, fr0.d))}. Quantos pedaços há em ${w} ${w === 1 ? 'inteiro' : 'inteiros'}?`,
    steps: [
      `Cada inteiro vale ${m(f(fr0.d, fr0.d))}, então ${w} ${w === 1 ? 'inteiro vale' : 'inteiros valem'} ${m(`${w} \\cdot ${fr0.d} = ${w * fr0.d}`)} pedaços.`,
      `Somando ${fr0.n === 1 ? 'o pedaço que sobra' : `os ${fr0.n} pedaços que sobram`}: ${m(`${w * fr0.d} + ${fr0.n} = ${result}`)}.`,
      `Logo, ${m(`${w}\\,${f(fr0.n, fr0.d)} = ${f(result, fr0.d)}`)}.`,
    ],
    data: { kind: 'frac-misto', w, n: fr0.n, d: fr0.d, result },
  };
}

function compare(rng: Rng): Question {
  let a: Rational, b: Rational;
  do {
    a = properFrac(rng, 2, 10);
    b = properFrac(rng, 2, 10);
  } while (a.n * b.d === b.n * a.d);
  const aBig = a.n * b.d > b.n * a.d;
  const [big, small] = aBig ? [a, b] : [b, a];
  const D = lcm(a.d, b.d);
  const steps =
    a.d === b.d
      ? [`Os denominadores são iguais: ganha quem tem mais pedaços, ${m(`${fr(big)} > ${fr(small)}`)}.`]
      : [
          `Coloque as duas no mesmo denominador: ${m(`${mmc(a.d, b.d)} = ${D}`)}.`,
          `${m(`${fr(a)} = ${f(a.n * (D / a.d), D)}`)} e ${m(`${fr(b)} = ${f(b.n * (D / b.d), D)}`)}.`,
          `Com pedaços do mesmo tamanho, ganha quem tem mais: ${m(`${fr(big)} > ${fr(small)}`)}.`,
        ];
  return {
    prompt: 'Qual destas frações é <b>maior</b>?',
    answer: choice(rng, m(fr(big)), [m(fr(small))]),
    answerDisplay: m(fr(big)),
    hint: 'Se os denominadores forem diferentes, reescreva as duas frações com o mesmo denominador e compare os numeradores.',
    steps,
    data: { kind: 'frac-comparar', a: [a.n, a.d], b: [b.n, b.d], result: [big.n, big.d] },
  };
}

function mulDiv(rng: Rng): Question {
  const isDiv = rng.chance(0.5);
  const a = rng.chance(0.2) ? R(rng.int(2, 6)) : properFrac(rng, 2, 9);
  const b = properFrac(rng, 2, 9);
  const result = isDiv ? div(a, b) : mul(a, b);
  const expr = `${fr(a)} ${isDiv ? '\\div' : '\\cdot'} ${fr(b)}`;
  const aT = a.d === 1 ? f(a.n, 1) : fr(a);
  const steps: string[] = [];
  let N: number, D: number;
  if (a.d === 1) steps.push(`Escreva o inteiro como fração: ${m(`${a.n} = ${f(a.n, 1)}`)}.`);
  if (isDiv) {
    steps.push(`Dividir por uma fração é multiplicar pelo seu inverso: o inverso de ${m(fr(b))} é ${m(f(b.d, b.n))}.`);
    N = a.n * b.d;
    D = a.d * b.n;
    steps.push(`${m(`${aT} \\cdot ${f(b.d, b.n)} = ${f(`${a.n} \\cdot ${b.d}`, `${a.d} \\cdot ${b.n}`)} = ${f(N, D)}`)}.`);
  } else {
    N = a.n * b.n;
    D = a.d * b.d;
    steps.push(`Multiplique numerador com numerador e denominador com denominador: ${m(`${aT} \\cdot ${fr(b)} = ${f(N, D)}`)}.`);
  }
  steps.push(...simplifySteps(N, D));
  steps.push(`Resultado: ${m(`${expr} = ${fr(result)}`)}.`);
  return {
    prompt: `Calcule e dê a resposta na forma mais simples: ${M(expr)}`,
    answer: fracAnswer(result),
    answerText: typed(result),
    answerDisplay: m(fr(result)),
    hint: isDiv
      ? 'Mantenha a primeira fração e multiplique pelo inverso da segunda (vire a segunda de cabeça para baixo).'
      : 'Multiplique "em linha": numerador vezes numerador, denominador vezes denominador. Depois simplifique.',
    steps,
    keys: ['/'],
    data: { kind: isDiv ? 'frac-div' : 'frac-mul', a: [a.n, a.d], b: [b.n, b.d] },
  };
}

/** a/b + c/d · e/f (ou −): a multiplicação vem antes. */
function expression(rng: Rng): Question {
  let a: Rational, b: Rational, c: Rational, prod: Rational, result: Rational;
  const op = rng.pick(['+', '-'] as const);
  do {
    a = properFrac(rng, 2, 6);
    b = properFrac(rng, 2, 6);
    c = properFrac(rng, 2, 6);
    prod = mul(b, c);
    result = op === '+' ? add(a, prod) : sub(a, prod);
  } while (result.n <= 0 || result.d > 36 || prod.d === 1);
  const expr = `${fr(a)} ${op} ${fr(b)} \\cdot ${fr(c)}`;
  const D = lcm(a.d, prod.d);
  const [na, np] = [a.n * (D / a.d), prod.n * (D / prod.d)];
  const N = op === '+' ? na + np : na - np;
  const steps = [
    `A multiplicação vem antes: ${m(`${fr(b)} \\cdot ${fr(c)} = ${f(b.n * c.n, b.d * c.d)}${gcd(b.n * c.n, b.d * c.d) > 1 ? ` = ${fr(prod)}` : ''}`)}.`,
    `Agora ${m(`${fr(a)} ${op} ${fr(prod)}`)}. ${a.d === prod.d ? `Os denominadores já são iguais.` : `Denominador comum: ${m(`${mmc(a.d, prod.d)} = ${D}`)}.`}`,
    `${m(`${f(na, D)} ${op} ${f(np, D)} = ${f(N, D)}`)}.`,
    ...simplifySteps(N, D),
    `Resultado: ${m(`${expr} = ${fr(result)}`)}.`,
  ];
  return {
    prompt: `Calcule e dê a resposta na forma mais simples: ${M(expr)}`,
    answer: fracAnswer(result),
    answerText: typed(result),
    answerDisplay: m(fr(result)),
    hint: 'Como nas contas com inteiros, a multiplicação vem antes da soma e da subtração.',
    steps,
    keys: ['/'],
    data: { kind: 'frac-expressao', a: [a.n, a.d], b: [b.n, b.d], c: [c.n, c.d], op },
  };
}

const NAMES = ['Ana', 'Bia', 'Caio', 'Davi', 'Lia', 'Théo', 'Júlia', 'Rafa'];

/** Problemas com contexto. */
function problem(rng: Rng): Question {
  const kind = rng.pick(['sobra', 'receita', 'percurso', 'copos'] as const);

  if (kind === 'sobra') {
    let a: Rational, b: Rational, rest: Rational;
    do {
      a = properFrac(rng, 2, 8);
      b = properFrac(rng, 2, 8);
      rest = sub(R(1), add(a, b));
    } while (rest.n <= 0 || a.d === b.d);
    const [p1, p2] = rng.shuffle(NAMES);
    const D = lcm(a.d, b.d);
    const eaten = add(a, b);
    return {
      prompt: `${p1} comeu ${m(fr(a))} de uma pizza e ${p2} comeu ${m(fr(b))} da mesma pizza. Que fração da pizza sobrou?`,
      answer: fracAnswer(rest),
      answerText: typed(rest),
      answerDisplay: m(fr(rest)),
      hint: `A pizza inteira é ${m('1')}. Some o que os dois comeram e tire do inteiro.`,
      steps: [
        `Os dois comeram, juntos, ${m(`${fr(a)} + ${fr(b)}`)}. Denominador comum: ${m(`${mmc(a.d, b.d)} = ${D}`)}.`,
        `${m(`${f(a.n * (D / a.d), D)} + ${f(b.n * (D / b.d), D)} = ${f(eaten.n * (D / eaten.d), D)}`)}.`,
        `A pizza inteira é ${m(f(D, D))}. Sobrou ${m(`${f(D, D)} - ${f(eaten.n * (D / eaten.d), D)} = ${f(rest.n * (D / rest.d), D)}`)}.`,
        ...simplifySteps(rest.n * (D / rest.d), D),
        `Sobrou ${m(fr(rest))} da pizza.`,
      ],
      keys: ['/'],
      data: { kind: 'frac-sobra', a: [a.n, a.d], b: [b.n, b.d] },
    };
  }

  if (kind === 'receita') {
    const qty = properFrac(rng, 2, 4);
    const factor = rng.pick([R(1, 2), R(1, 3), R(2, 3), R(3, 2), R(3, 4)]);
    const [unit, units, what] = rng.pick([
      ['xícara', 'xícaras', 'açúcar'],
      ['xícara', 'xícaras', 'farinha'],
      ['litro', 'litros', 'leite'],
      ['colher', 'colheres', 'manteiga'],
    ] as const);
    const result = mul(qty, factor);
    const N = factor.n * qty.n;
    const D = factor.d * qty.d;
    const portion =
      factor.n === 1 && factor.d === 2 ? 'meia receita' : factor.n === 3 && factor.d === 2 ? 'uma receita e meia' : `${m(fr(factor))} da receita`;
    return {
      prompt: `Uma receita leva ${m(fr(qty))} de ${unit} de ${what}. Quanto de ${what} vai se você fizer ${portion}? (Responda em ${units}.)`,
      answer: fracAnswer(result),
      answerText: typed(result),
      answerDisplay: m(`${fr(result)}\\text{ de ${unit}}`),
      hint: `Fazer ${portion} é pegar ${m(fr(factor))} de cada ingrediente, e "uma fração de" algo é uma multiplicação.`,
      steps: [
        `Fazer ${portion} é pegar ${m(fr(factor))} de cada ingrediente: ${m(`${fr(factor)} \\cdot ${fr(qty)}`)}.`,
        `${m(`${fr(factor)} \\cdot ${fr(qty)} = ${f(`${factor.n} \\cdot ${qty.n}`, `${factor.d} \\cdot ${qty.d}`)} = ${f(N, D)}`)}.`,
        ...simplifySteps(N, D),
        `Vai ${m(fr(result))} de ${unit} de ${what}.`,
      ],
      keys: ['/'],
      data: { kind: 'frac-receita', a: [qty.n, qty.d], b: [factor.n, factor.d] },
    };
  }

  if (kind === 'percurso') {
    let a: Rational, b: Rational;
    do {
      a = properFrac(rng, 2, 6);
      b = properFrac(rng, 2, 6);
    } while (a.d === b.d || sub(R(1), add(a, b)).n <= 0);
    const L = lcm(a.d, b.d);
    const total = L * rng.int(1, Math.max(1, Math.floor(120 / L)));
    const [d1, d2] = [(total / a.d) * a.n, (total / b.d) * b.n];
    const left = total - d1 - d2;
    const who = rng.pick(NAMES);
    return {
      prompt: `${who} vai pedalar ${total} km. De manhã percorreu ${m(fr(a))} do caminho e à tarde, ${m(fr(b))} do caminho. Quantos quilômetros ainda faltam?`,
      answer: intAnswer(left),
      answerText: String(left),
      suffix: 'km',
      answerDisplay: m(`${left}\\text{ km}`),
      hint: `Calcule quanto é ${m(fr(a))} de ${total} e ${m(fr(b))} de ${total}, e tire do total.`,
      steps: [
        `De manhã: ${m(`${fr(a)} \\text{ de } ${total} = ${total} \\div ${a.d} \\cdot ${a.n} = ${d1}`)} km.`,
        `À tarde: ${m(`${fr(b)} \\text{ de } ${total} = ${total} \\div ${b.d} \\cdot ${b.n} = ${d2}`)} km.`,
        `Faltam ${m(`${total} - ${d1} - ${d2} = ${left}`)} km.`,
      ],
      data: { kind: 'frac-percurso', a: [a.n, a.d], b: [b.n, b.d], total, result: left },
    };
  }

  // Quantos copos cabem numa jarra? (divisão por fração)
  const cup = rng.pick([R(1, 4), R(1, 5), R(1, 3), R(1, 8), R(3, 4), R(2, 5)]);
  // Jarra com litros inteiros: A = n·t litros e cabem d·t copos.
  const t = rng.int(1, cup.n > 1 ? 2 : 3);
  const count = cup.d * t;
  const amount = R(cup.n * t);
  return {
    prompt: `Uma jarra tem ${m(`${fr(amount)}\\text{ L}`)} de suco. Quantos copos de ${m(`${fr(cup)}\\text{ L}`)} dá para encher?`,
    answer: intAnswer(count),
    answerText: String(count),
    answerDisplay: m(`${count}\\text{ copos}`),
    hint: `A pergunta é "quantas vezes ${m(fr(cup))} cabe em ${m(fr(amount))}": isso é uma divisão.`,
    steps: [
      `Quantas vezes ${m(fr(cup))} cabe em ${m(fr(amount))}? É a divisão ${m(`${fr(amount)} \\div ${fr(cup)}`)}.`,
      `Multiplique pelo inverso: ${m(`${fr(amount)} \\cdot ${f(cup.d, cup.n)} = ${f(amount.n * cup.d, amount.d * cup.n)} = ${count}`)}.`,
      `Dá para encher ${count} copos.`,
    ],
    data: { kind: 'frac-copos', a: [amount.n, amount.d], b: [cup.n, cup.d], result: count },
  };
}

const fracoes: Generator = {
  id: 'fracoes',
  title: 'Frações',
  generate(level, rng) {
    if (level === 1) {
      const kind = rng.pick(['fig', 'fig', 'fig', 'qty', 'qty', 'simp', 'sum'] as const);
      if (kind === 'fig') return figure(rng);
      if (kind === 'qty') return ofQuantity(rng, 6, 6);
      if (kind === 'simp') return simplify(rng);
      return addSub(rng, true);
    }
    if (level === 2) {
      const kind = rng.pick(['eq', 'eq', 'cmp', 'cmp', 'sum', 'sum', 'sum', 'mix', 'qty'] as const);
      if (kind === 'eq') return equivalent(rng);
      if (kind === 'cmp') return compare(rng);
      if (kind === 'mix') return mixed(rng);
      if (kind === 'qty') return ofQuantity(rng, 10, 12);
      return addSub(rng, false);
    }
    const kind = rng.pick(['md', 'md', 'md', 'expr', 'expr', 'prob', 'prob', 'prob'] as const);
    if (kind === 'md') return mulDiv(rng);
    if (kind === 'expr') return expression(rng);
    return problem(rng);
  },
};

export default fracoes;
