// Números inteiros: comparar, somar e subtrair com sinais.

import type { Rng } from '@/lib/math/random';
import type { Generator, Question } from './types';
import { m, M, tn, par, pn, intAnswer, choice } from './_util';

type Term = { op: '+' | '-'; v: number };

function compare(rng: Rng, range: number): Question {
  let a: number, b: number;
  do {
    a = rng.int(-range, range);
    b = rng.int(-range, range);
  } while (a === b || (a >= 0 && b >= 0));
  const big = Math.max(a, b);
  const small = Math.min(a, b);
  return {
    prompt: 'Qual destes números é <b>maior</b>?',
    answer: choice(rng, m(tn(big)), [m(tn(small))]),
    answerDisplay: m(tn(big)),
    hint: 'Na reta numérica, quem está mais à direita é maior. Entre dois negativos, o mais perto do zero é o maior.',
    steps: [
      `Imagine os dois números na reta: ${m(tn(small))} fica à esquerda de ${m(tn(big))}.`,
      `Quanto mais à direita, maior o número. Logo, ${m(`${tn(big)} > ${tn(small)}`)}.`,
    ],
    data: { kind: 'max', values: [a, b], result: big },
  };
}

/** Expressão de soma/subtração de inteiros, com resolução que troca subtração por soma do oposto. */
function expression(terms: Term[]): Question {
  const expr = terms.map((t, i) => (i === 0 ? tn(t.v) : `${t.op} ${par(t.v)}`)).join(' ');
  const signed = terms.map((t) => (t.op === '-' ? -t.v : t.v));
  const result = signed.reduce((s, x) => s + x, 0);
  const simple = signed.map((v, i) => (i === 0 ? tn(v) : v < 0 ? `- ${tn(-v)}` : `+ ${tn(v)}`)).join(' ');

  const steps: string[] = [];
  // Só reescreve quando há número negativo depois do primeiro (ex.: 3 − (−5)).
  if (terms.some((t, i) => i > 0 && t.v < 0)) {
    steps.push(`Subtrair é somar o oposto, e ${m('+(-a)')} é o mesmo que ${m('-a')}. Reescrevendo: ${m(simple)}.`);
  }
  if (signed.length > 2) {
    const pos = signed.filter((v) => v > 0).reduce((s, x) => s + x, 0);
    const neg = signed.filter((v) => v < 0).reduce((s, x) => s + x, 0);
    steps.push(`Junte os positivos: ${m(tn(pos))}. Junte os negativos: ${m(tn(neg))}.`);
    steps.push(`Agora ${m(`${tn(pos)} - ${tn(-neg)} = ${tn(result)}`)}: a diferença fica com o sinal de quem está mais longe do zero.`);
  } else {
    const [a, b] = signed;
    const [hi, lo] = [Math.max(Math.abs(a), Math.abs(b)), Math.min(Math.abs(a), Math.abs(b))];
    if (a >= 0 === b >= 0) {
      steps.push(`Os dois têm o mesmo sinal: some as distâncias até o zero (${m(`${Math.abs(a)} + ${Math.abs(b)} = ${Math.abs(a) + Math.abs(b)}`)}) e mantenha o sinal.`);
    } else {
      steps.push(`Sinais diferentes: subtraia as distâncias até o zero (${m(`${hi} - ${lo} = ${hi - lo}`)}) e use o sinal de quem está mais longe do zero.`);
    }
  }
  steps.push(`Resultado: ${m(`${expr} = ${tn(result)}`)}.`);

  return {
    prompt: `Calcule: ${M(expr)}`,
    answer: intAnswer(result),
    answerText: pn(result),
    answerDisplay: m(tn(result)),
    hint: `Pense na reta numérica: somar positivo anda para a direita, somar negativo anda para a esquerda. E ${m('a - (-b) = a + b')}.`,
    steps,
    data: { kind: 'sum', signed, result },
  };
}

/** Multiplicação ou divisão exata (montada de trás para frente: dividendo = divisor × quociente). */
function product(rng: Rng, max: number): Question {
  const a = rng.nonZero(-max, max);
  const b = rng.nonZero(-max, max);
  const isDiv = rng.chance(0.45);
  const [x, y, result] = isDiv ? [a * b, b, a] : [a, b, a * b];
  const sym = isDiv ? '\\div' : '\\cdot';
  const expr = `${par(x)} ${sym} ${par(y)}`;
  const same = x < 0 === y < 0;
  return {
    prompt: `Calcule: ${M(expr)}`,
    answer: intAnswer(result),
    answerText: pn(result),
    answerDisplay: m(tn(result)),
    hint: `Primeiro faça a conta sem os sinais. Depois o jogo de sinais: sinais iguais dão ${m('+')}, sinais diferentes dão ${m('-')}.`,
    steps: [
      `Sem os sinais: ${m(`${Math.abs(x)} ${sym} ${Math.abs(y)} = ${Math.abs(result)}`)}.`,
      `Sinais: ${m(x < 0 ? '-' : '+')} e ${m(y < 0 ? '-' : '+')} são ${same ? 'iguais, então o resultado é positivo' : 'diferentes, então o resultado é negativo'}.`,
      `Resultado: ${m(`${expr} = ${tn(result)}`)}.`,
    ],
    data: { kind: isDiv ? 'div' : 'mul', x, y, result },
  };
}

const CITIES = ['Urupema (SC)', 'São Joaquim (SC)', 'uma estação na Antártida', 'Gramado (RS)', 'uma câmara frigorífica'];

function temperature(rng: Rng): Question {
  const start = rng.int(-15, 5);
  const delta = rng.nonZero(-12, 14);
  const end = start + delta;
  const deg = (v: number) => `${tn(v)}\\,^\\circ\\text{C}`;
  const up = delta > 0;
  return {
    prompt: `Em ${rng.pick(CITIES)}, o termômetro marcava ${m(deg(start))} de madrugada. Ao longo da manhã, a temperatura ${up ? 'subiu' : 'caiu'} ${Math.abs(delta)} graus. Qual a temperatura final?`,
    answer: intAnswer(end),
    answerText: pn(end),
    suffix: '°C',
    answerDisplay: m(deg(end)),
    hint: `${up ? 'Subir' : 'Cair'} ${Math.abs(delta)} graus é andar para a ${up ? 'direita' : 'esquerda'} na reta: calcule ${m(`${tn(start)} ${up ? '+' : '-'} ${Math.abs(delta)}`)}.`,
    steps: [
      `A temperatura começa em ${m(tn(start))} e ${up ? 'sobe' : 'cai'} ${Math.abs(delta)}: ${m(`${tn(start)} ${up ? '+' : '-'} ${Math.abs(delta)}`)}.`,
      `Resultado: ${m(deg(end))}.`,
    ],
    data: { kind: 'sum', signed: [start, delta], result: end },
  };
}

function bank(rng: Rng): Question {
  const saldo = rng.int(-200, 300);
  const gasto = rng.int(5, 40) * 10;
  const deposito = rng.int(2, 30) * 10;
  const end = saldo - gasto + deposito;
  const money = (v: number) => `${v < 0 ? '-' : ''}\\text{R\\$}\\,${tn(Math.abs(v))}`;
  return {
    prompt: `Uma conta tinha saldo de ${m(money(saldo))}. Foi feito um pagamento de ${m(money(gasto))} e depois um depósito de ${m(money(deposito))}. Qual o saldo final? (Use o sinal de menos se ficar negativo.)`,
    answer: intAnswer(end),
    answerText: pn(end),
    prefix: 'R$',
    answerDisplay: m(money(end)),
    hint: 'Pagamento tira dinheiro (subtrai); depósito coloca (soma). Saldo negativo é dívida com o banco.',
    steps: [
      `Monte a conta: ${m(`${par(saldo)} - ${gasto} + ${deposito}`)}.`,
      `${m(`${tn(saldo)} - ${gasto} = ${tn(saldo - gasto)}`)}.`,
      `${m(`${tn(saldo - gasto)} + ${deposito} = ${tn(end)}`)}. Saldo final: ${m(money(end))}.`,
    ],
    data: { kind: 'sum', signed: [saldo, -gasto, deposito], result: end },
  };
}

/** Figura: reta numérica de `min` a `max` com um ponto marcado (rótulos de 5 em 5). */
function numberLineSvg(min: number, max: number, point: number): string {
  const W = 340, P = 16, Y = 46;
  const x = (v: number) => P + ((v - min) / (max - min)) * (W - 2 * P);
  let ticks = '';
  for (let v = min; v <= max; v++) {
    const big = v % 5 === 0;
    ticks += `<line x1="${x(v)}" x2="${x(v)}" y1="${Y - (big ? 8 : 5)}" y2="${Y + (big ? 8 : 5)}" class="s-ink2" stroke-width="${v === 0 ? 2.5 : 1.3}"/>`;
    if (big) ticks += `<text x="${x(v)}" y="${Y + 26}" text-anchor="middle" font-size="12" class="f-ink2">${v < 0 ? '−' + -v : v}</text>`;
  }
  return `<svg viewBox="0 0 ${W} 84" role="img" aria-label="Reta numérica com um ponto marcado"><line x1="${P - 8}" x2="${W - P + 8}" y1="${Y}" y2="${Y}" class="s-ink2" stroke-width="2"/>${ticks}<circle cx="${x(point)}" cy="${Y}" r="7" class="f-acc"/><text x="${x(point)}" y="${Y - 16}" text-anchor="middle" font-size="15" font-weight="800" class="f-acc">?</text></svg>`;
}

function locate(rng: Rng, level: number): Question {
  const [min, max] = level === 1 ? [-10, 10] : [-15, 15];
  let p: number;
  do p = rng.int(min + 1, max - 1);
  while (p % 5 === 0 && level > 1);
  return {
    prompt: 'Que número inteiro está marcado na reta?',
    figure: numberLineSvg(min, max, p),
    answer: intAnswer(p),
    answerText: pn(p),
    answerDisplay: m(tn(p)),
    hint: 'Ache o rótulo mais próximo (os números de 5 em 5) e conte os tracinhos até o ponto. À esquerda do zero, os números são negativos.',
    steps: [
      `O rótulo mais próximo é ${m(tn(Math.round(p / 5) * 5))}.`,
      `Contando os tracinhos a partir dele, o ponto fica em ${m(tn(p))}.`,
    ],
    data: { kind: 'int-reta', point: p, result: p },
  };
}

function opposite(rng: Rng, level: number): Question {
  const n = rng.nonZero(-(level === 1 ? 20 : 300), level === 1 ? 20 : 300);
  const twice = level === 3 && rng.chance(0.5);
  const result = twice ? n : -n;
  const expr = twice ? `-(${tn(-n)})` : `-(${tn(n)})`;
  return {
    prompt: twice ? `Qual é o oposto do oposto de ${m(tn(n))}? Em outras palavras, quanto vale ${m(`-(-(${tn(n)}))`)}?` : `Qual é o <b>oposto</b> de ${m(tn(n))}?`,
    answer: intAnswer(result),
    answerText: pn(result),
    answerDisplay: m(tn(result)),
    hint: 'O oposto é o "espelho" do outro lado do zero: mesma distância, sinal trocado.',
    steps: twice
      ? [`O oposto de ${m(tn(n))} é ${m(tn(-n))}.`, `O oposto desse é de novo ${m(tn(n))}: espelhar duas vezes volta ao lugar.`]
      : [`Trocar o sinal: ${m(`${expr} = ${tn(result)}`)}.`, `Os dois estão à mesma distância do zero (${m(String(Math.abs(n)))}), um de cada lado.`],
    data: { kind: 'int-oposto', n, twice, result },
  };
}

function absolute(rng: Rng, level: number): Question {
  if (level === 3) {
    // distância entre dois inteiros: |a − b|
    const a = rng.int(-25, 25);
    let b: number;
    do b = rng.int(-25, 25);
    while (b === a);
    const result = Math.abs(a - b);
    return {
      prompt: `Qual é a <b>distância</b> entre ${m(tn(a))} e ${m(tn(b))} na reta numérica? Ou seja, quanto vale ${m(`|${tn(a)} - ${par(b)}|`)}?`,
      answer: intAnswer(result),
      answerText: pn(result),
      answerDisplay: m(tn(result)),
      hint: 'A distância entre dois números é o módulo da diferença: subtraia e tire o sinal.',
      steps: [
        `Diferença: ${m(`${tn(a)} - ${par(b)} = ${tn(a - b)}`)}.`,
        `Distância é sempre positiva: ${m(`|${tn(a - b)}| = ${result}`)}.`,
      ],
      data: { kind: 'int-modulo', a, b, form: 'distancia', result },
    };
  }
  if (level === 2) {
    const a = rng.nonZero(-30, 30), b = rng.nonZero(-30, 30);
    const result = Math.abs(a) + Math.abs(b);
    return {
      prompt: `Calcule: ${M(`|${tn(a)}| + |${tn(b)}|`)}`,
      answer: intAnswer(result),
      answerText: pn(result),
      answerDisplay: m(tn(result)),
      hint: 'O módulo é a distância até o zero, sempre positiva. Calcule cada módulo e depois some.',
      steps: [`${m(`|${tn(a)}| = ${Math.abs(a)}`)} e ${m(`|${tn(b)}| = ${Math.abs(b)}`)}.`, `Somando: ${m(`${Math.abs(a)} + ${Math.abs(b)} = ${result}`)}.`],
      data: { kind: 'int-modulo', a, b, form: 'soma', result },
    };
  }
  const n = rng.nonZero(-20, 20);
  return {
    prompt: `Quanto vale ${m(`|${tn(n)}|`)} (o módulo de ${m(tn(n))})?`,
    answer: intAnswer(Math.abs(n)),
    answerText: pn(Math.abs(n)),
    answerDisplay: m(String(Math.abs(n))),
    hint: 'Módulo é a distância até o zero, então nunca é negativo.',
    steps: [`${m(tn(n))} está a ${Math.abs(n)} casas do zero.`, `Logo, ${m(`|${tn(n)}| = ${Math.abs(n)}`)}.`],
    data: { kind: 'int-modulo', a: n, form: 'simples', result: Math.abs(n) },
  };
}

const inteiros: Generator = {
  id: 'inteiros',
  title: 'Números inteiros',
  generate(level, rng) {
    // Tipos da reta, do oposto e do módulo (micro-aulas "A reta numérica" e "Oposto e módulo")
    const extra = rng.next();
    if (extra < 0.12) return locate(rng, level);
    if (extra < 0.2) return opposite(rng, level);
    if (extra < 0.28) return absolute(rng, level);
    if (level === 1) {
      if (rng.chance(0.25)) return compare(rng, 12);
      let a: number;
      do a = rng.int(-10, 10);
      while (a >= 0 && rng.chance(0.7));
      return expression([{ op: '+', v: a }, { op: rng.pick(['+', '-'] as const), v: rng.int(1, 10) }]);
    }
    if (level === 2) {
      const kind = rng.pick(['cmp', 'sum', 'sum', 'temp', 'temp', 'prod', 'prod'] as const);
      if (kind === 'cmp') return compare(rng, 60);
      if (kind === 'prod') return product(rng, 9);
      if (kind === 'temp') return temperature(rng);
      const b = rng.int(1, 20) * (rng.chance(0.75) ? -1 : 1);
      return expression([{ op: '+', v: rng.nonZero(-20, 20) }, { op: rng.pick(['+', '-'] as const), v: b }]);
    }
    const kind = rng.pick(['bank', 'prod', 'sum', 'sum'] as const);
    if (kind === 'bank') return bank(rng);
    if (kind === 'prod') return product(rng, 15);
    const terms: Term[] = [{ op: '+', v: rng.nonZero(-30, 30) }];
    for (let i = rng.int(3, 4); i > 1; i--) terms.push({ op: rng.pick(['+', '-'] as const), v: rng.nonZero(-30, 30) });
    return expression(terms);
  },
};

export default inteiros;
