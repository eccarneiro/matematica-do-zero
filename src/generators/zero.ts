// O zero: valor posicional, o zero como "casa vazia" e o zero como número.

import type { Rng } from '@/lib/math/random';
import type { Generator, Question } from './types';
import { m, M, tn, pn, intAnswer, choice } from './_util';

/** Nome da casa (para "casa das ..."), do quantificador no singular e no plural. */
const CASA = ['unidades', 'dezenas', 'centenas', 'unidades de milhar', 'dezenas de milhar', 'centenas de milhar', 'unidades de milhão'];
const UM = ['unidade', 'dezena', 'centena', 'milhar', 'dezena de milhar', 'centena de milhar', 'milhão'];
const VARIOS = ['unidades', 'dezenas', 'centenas', 'milhares', 'dezenas de milhar', 'centenas de milhar', 'milhões'];

const pow10 = (k: number) => 10 ** k;
const qty = (d: number, k: number) => `${d} ${d === 1 ? UM[k] : VARIOS[k]}`;
/** Algarismos do número, do mais à direita (unidades) para a esquerda. */
const digitsOf = (n: number) => String(n).split('').reverse().map(Number);

/** Número sorteado com `len` algarismos e pelo menos um zero no meio ou no fim. */
function withZeros(rng: Rng, len: number, zeroChance = 0.4): number {
  for (;;) {
    const ds = [rng.int(1, 9)];
    for (let i = 1; i < len; i++) ds.push(rng.chance(zeroChance) ? 0 : rng.int(1, 9));
    if (ds.includes(0) && ds.some((d, i) => i > 0 && d !== 0)) return Number(ds.join(''));
  }
}

/** Número em LaTeX com o algarismo da posição `pos` sublinhado. */
function underlined(n: number, pos: number): string {
  const s = String(n);
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const k = s.length - 1 - i;
    out += k === pos ? `\\underline{${s[i]}}` : s[i];
    if (k > 0 && k % 3 === 0) out += '{.}';
  }
  return out;
}

/** Soma das parcelas não nulas da forma decomposta: 3.000 + 40 + 5. */
const expandedSum = (n: number) =>
  digitsOf(n)
    .map((d, k) => d * pow10(k))
    .filter((v) => v !== 0)
    .reverse()
    .map(tn)
    .join(' + ');

/** Forma decomposta completa, com as casas vazias: 3·1000 + 0·100 + 4·10 + 5. */
const expandedFull = (n: number) =>
  digitsOf(n)
    .map((d, k) => (k === 0 ? String(d) : `${d} \\cdot ${tn(pow10(k))}`))
    .reverse()
    .join(' + ');

function digitValue(rng: Rng, len: number): Question {
  const n = withZeros(rng, len, 0.3);
  const ds = digitsOf(n);
  const options = ds.map((d, k) => (d !== 0 ? k : -1)).filter((k) => k >= 0);
  const pos = rng.pick(options);
  const d = ds[pos];
  const result = d * pow10(pos);
  return {
    prompt: `Quanto vale o algarismo sublinhado no número ${m(underlined(n, pos))}?`,
    answer: intAnswer(result),
    answerText: pn(result),
    answerDisplay: m(tn(result)),
    hint: 'Conte as casas da direita para a esquerda: unidades, dezenas, centenas, milhares... Cada casa vale 10 vezes a casa à sua direita.',
    steps: [
      `Da direita para a esquerda, o ${m(String(d))} está na casa das <b>${CASA[pos]}</b>.`,
      pos === 0
        ? `Na casa das unidades, ele vale ${m(String(d))}.`
        : `Cada ${UM[pos]} vale ${m(tn(pow10(pos)))}, então ele vale ${m(`${d} \\cdot ${tn(pow10(pos))} = ${tn(result)}`)}.`,
      ...(ds.slice(0, pos).includes(0)
        ? [`Os zeros à direita do ${m(String(d))} são casas vazias: é graças a eles que o ${m(String(d))} fica na posição certa.`]
        : []),
    ],
    data: { kind: 'zero-digit-value', n, pos, result },
  };
}

/** "Qual número tem 4 milhares, 0 centenas, 2 dezenas e 7 unidades?" */
function compose(rng: Rng, len: number, onlyNonZero: boolean): Question {
  const n = withZeros(rng, len, onlyNonZero ? 0.55 : 0.35);
  const ds = digitsOf(n);
  const places = ds
    .map((d, k) => ({ d, k }))
    .filter((p) => !onlyNonZero || p.d !== 0)
    .reverse();
  const parts = places.map((p) => qty(p.d, p.k));
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} e ${parts[parts.length - 1]}` : parts[0];
  const empty = ds.map((d, k) => (d === 0 ? `das ${CASA[k]}` : '')).filter(Boolean).reverse();
  return {
    prompt: `Qual número tem ${list}?`,
    answer: intAnswer(n),
    answerText: pn(n),
    answerDisplay: m(tn(n)),
    hint: onlyNonZero
      ? 'Escreva uma casa para cada posição, da maior até as unidades. A casa que não foi citada fica vazia: ponha um zero nela.'
      : 'Escreva os algarismos na ordem das casas, da maior para a menor. Zero centenas significa um 0 na casa das centenas.',
    steps: [
      `Uma casa para cada posição, da maior até as unidades: ${ds
        .map((d, k) => `${CASA[k]}: ${d}`)
        .reverse()
        .join('; ')}.`,
      `${empty.length === 1 ? 'A casa' : 'As casas'} ${empty.join(', ')} ${empty.length === 1 ? 'fica vazia e recebe' : 'ficam vazias e recebem'} o ${m('0')}.`,
      `Juntando: ${m(`${expandedSum(n)} = ${tn(n)}`)}.`,
    ],
    data: { kind: 'zero-compose', digits: places.map((p) => [p.k, p.d]), result: n },
  };
}

/** Propriedades do zero numa conta curta: a + 0, a · 0, 0 ÷ a, a − a... */
function property(rng: Rng): Question {
  const a = rng.int(2, rng.chance(0.5) ? 99 : 9999);
  const form = rng.pick(['a+0', '0+a', 'a*0', '0*a', 'a-0', '0/a', 'a-a', 'a*0'] as const);
  const [x, op, y] = {
    'a+0': [a, '+', 0], '0+a': [0, '+', a], 'a*0': [a, '*', 0], '0*a': [0, '*', a],
    'a-0': [a, '-', 0], '0/a': [0, '/', a], 'a-a': [a, '-', a],
  }[form] as [number, string, number];
  const sym = { '+': '+', '-': '-', '*': '\\times', '/': '\\div' }[op];
  const result = op === '+' ? x + y : op === '-' ? x - y : op === '*' ? x * y : x / y;
  const expr = `${tn(x)} ${sym} ${tn(y)}`;
  const why = {
    'a+0': `Somar zero não muda nada: ${m('a + 0 = a')}.`,
    '0+a': `Somar zero não muda nada: ${m('0 + a = a')}.`,
    'a*0': `Multiplicar por zero sempre dá zero: são ${m(tn(a))} grupos sem nada dentro, ou seja, ${m('0 + 0 + \\dots + 0 = 0')}.`,
    '0*a': `Multiplicar por zero sempre dá zero: nenhum grupo de ${m(tn(a))} objetos dá ${m('0')} objetos.`,
    'a-0': `Tirar zero não tira nada: ${m('a - 0 = a')}.`,
    '0/a': `Repartir nada entre ${m(tn(a))} pessoas dá nada para cada uma. Confira: ${m(`0 \\times ${tn(a)} = 0`)}.`,
    'a-a': `Tirando tudo o que se tem, não sobra nada: ${m('a - a = 0')}.`,
  }[form];
  return {
    prompt: `Calcule: ${M(expr)}`,
    answer: intAnswer(result),
    answerText: pn(result),
    answerDisplay: m(tn(result)),
    hint: `Lembre do que o zero faz: ${m('a + 0 = a')}, ${m('a \\times 0 = 0')} e ${m('0 \\div a = 0')}.`,
    steps: [why, `Resultado: ${m(`${expr} = ${tn(result)}`)}.`],
    data: { kind: 'zero-op', x, op, y, result },
  };
}

/** Forma decomposta → número ("7.000 + 40 + 2"). */
function fromExpanded(rng: Rng, len: number): Question {
  const n = withZeros(rng, len, 0.45);
  const ds = digitsOf(n);
  const full = rng.chance(0.4);
  const parts = ds.map((d, k) => d * pow10(k)).filter((v, k) => full || ds[k] !== 0);
  const expr = full ? expandedFull(n) : expandedSum(n);
  const missing = ds.map((d, k) => (d === 0 ? CASA[k] : '')).filter(Boolean).reverse();
  return {
    prompt: `Que número é este? ${M(expr)}`,
    answer: intAnswer(n),
    answerText: pn(n),
    answerDisplay: m(tn(n)),
    hint: full
      ? 'Cada parcela diz quantas unidades, dezenas, centenas... o número tem. Uma parcela com zero é uma casa vazia.'
      : 'Veja qual a maior casa usada e escreva um algarismo para cada casa até as unidades. Casa que não aparece na soma recebe 0.',
    steps: [
      `A maior parcela está na casa das ${CASA[len - 1]}, então o número tem ${len} algarismos.`,
      `${full ? 'Parcelas com zero' : 'Não aparecem'}: ${missing.join(', ')}. ${missing.length === 1 ? 'Essa casa recebe' : 'Essas casas recebem'} o ${m('0')}.`,
      `O número é ${m(tn(n))}.`,
    ],
    data: { kind: 'zero-expanded', parts, result: n },
  };
}

/** Número → decomposição correta (múltipla escolha). */
function toExpanded(rng: Rng): Question {
  const n = withZeros(rng, 4, 0.35);
  const s = String(n);
  const wrongNums = new Set<number>();
  const noZero = Number(s.replace(/0/g, ''));
  if (noZero !== n) wrongNums.add(noZero);
  while (wrongNums.size < 3) {
    const p = rng.shuffle(s.split(''));
    if (p[0] === '0' && rng.chance(0.5)) p.push(p.shift()!);
    const v = Number(p.join(''));
    if (v !== n && String(v).length >= 3) wrongNums.add(v);
  }
  const wrong = [...wrongNums].slice(0, 3).map((v) => m(expandedSum(v)));
  return {
    prompt: `Qual destas somas é igual a ${m(tn(n))}?`,
    answer: choice(rng, m(expandedSum(n)), wrong),
    answerDisplay: m(`${tn(n)} = ${expandedSum(n)}`),
    hint: 'Leia o número casa por casa, da esquerda para a direita. Onde houver um 0, aquela casa não entra na soma, mas continua ocupando o seu lugar.',
    steps: [
      `Casa por casa: ${m(expandedFull(n))}.`,
      `As parcelas com zero valem ${m('0')} e podem ser omitidas: ${m(expandedSum(n))}.`,
      `Cuidado: ignorar o zero muda o número. ${m(tn(noZero))} é bem diferente de ${m(tn(n))}.`,
    ],
    data: { kind: 'zero-to-expanded', n },
  };
}

/** Comparar números feitos com os mesmos algarismos e zeros em lugares diferentes. */
function compare(rng: Rng): Question {
  const a = rng.int(1, 9);
  let b: number;
  do b = rng.int(1, 9);
  while (b === a);
  const pool = [`${a}0${b}`, `${a}${b}0`, `${a}${b}`, `${a}00${b}`, `${a}0${b}0`, `${b}0${a}`, `${a}${b}00`, `${b}${a}0`];
  const values = rng.shuffle(pool).slice(0, rng.pick([3, 4])).map(Number);
  const big = rng.chance(0.6);
  const result = big ? Math.max(...values) : Math.min(...values);
  const sorted = [...values].sort((x, y) => x - y);
  return {
    prompt: `Qual destes números é o <b>${big ? 'maior' : 'menor'}</b>?`,
    answer: choice(rng, m(tn(result)), values.filter((v) => v !== result).map((v) => m(tn(v)))),
    answerDisplay: m(tn(result)),
    hint: 'Primeiro conte os algarismos: quem tem mais algarismos é maior (os zeros contam!). Empatou? Compare da esquerda para a direita.',
    steps: [
      `Quantidade de algarismos: ${values.map((v) => `${m(tn(v))} tem ${String(v).length}`).join(', ')}.`,
      'Com a mesma quantidade de algarismos, compare casa por casa, da esquerda para a direita.',
      `Em ordem: ${m(sorted.map(tn).join(' < '))}. O ${big ? 'maior' : 'menor'} é ${m(tn(result))}.`,
    ],
    data: { kind: 'zero-compare', values, big, result },
  };
}

const NAO_EXISTE = 'Não existe: não dá para dividir por zero';

/** a ÷ 0 (impossível) ou 0 ÷ a, sempre como múltipla escolha. */
function division(rng: Rng, allowZeroZero: boolean): Question {
  const a = rng.int(2, 50);
  const mode = rng.pick(allowZeroZero ? (['a/0', 'a/0', '0/a', '0/0'] as const) : (['a/0', 'a/0', '0/a'] as const));
  const [x, y] = mode === 'a/0' ? [a, 0] : mode === '0/a' ? [0, a] : [0, 0];
  const expr = `${x} \\div ${y}`;
  const correct = y === 0 ? NAO_EXISTE : m('0');
  const options = [m('0'), m('1'), NAO_EXISTE, ...(x !== 0 ? [m(String(x))] : [m(String(a))])];
  const steps =
    mode === 'a/0'
      ? [
          `Dividir é desfazer a multiplicação: ${m(`${x} \\div 0 = ?`)} pede um número que, vezes ${m('0')}, dê ${m(String(x))}.`,
          `Mas qualquer número vezes ${m('0')} dá ${m('0')}, nunca ${m(String(x))}. Não há resposta.`,
          `Por isso ${m(`${x} \\div 0`)} <b>não existe</b>: não se divide por zero.`,
        ]
      : mode === '0/a'
        ? [
            `${m(`0 \\div ${a} = ?`)} pede um número que, vezes ${m(String(a))}, dê ${m('0')}.`,
            `Esse número é o ${m('0')}, porque ${m(`0 \\times ${a} = 0`)}. Repartir nada dá nada.`,
          ]
        : [
            `${m('0 \\div 0 = ?')} pede um número que, vezes ${m('0')}, dê ${m('0')}.`,
            `Só que <b>todo</b> número serve: ${m('1 \\times 0 = 0')}, ${m('7 \\times 0 = 0')}... Não há um único resultado.`,
            `Por isso também ${m('0 \\div 0')} fica sem resultado (os matemáticos dizem que é <i>indeterminado</i>): não se divide por zero.`,
          ];
  return {
    prompt: `Quanto é ${m(expr)}?`,
    answer: choice(rng, correct, options.filter((o) => o !== correct)),
    answerDisplay: y === 0 ? NAO_EXISTE : m(`${expr} = 0`),
    hint: `Transforme a divisão numa multiplicação: ${m('x \\div y = q')} quer dizer ${m('q \\times y = x')}.`,
    steps,
    data: { kind: 'zero-div', x, y },
  };
}

type Term = { x: number; op?: '*' | '/'; y?: number };

/** Expressão curta com termos que usam o zero: 7 × 0 + 15 ÷ 3. */
function expression(rng: Rng, count: number, max: number): Question {
  const zeroTerm = (): Term => {
    const a = rng.int(2, max);
    return rng.pick<Term>([{ x: a, op: '*', y: 0 }, { x: 0, op: '*', y: a }, { x: 0, op: '/', y: a }]);
  };
  const otherTerm = (): Term => {
    const a = rng.int(2, 9);
    const b = rng.int(2, 9);
    return rng.pick<Term>([{ x: a, op: '*', y: b }, { x: a * b, op: '/', y: b }, { x: rng.int(2, max) }]);
  };
  const val = (t: Term) => (t.op === '*' ? t.x * t.y! : t.op === '/' ? t.x / t.y! : t.x);
  const sym = (t: Term) => (t.op ? `${tn(t.x)} ${t.op === '*' ? '\\times' : '\\div'} ${tn(t.y!)}` : tn(t.x));

  let terms: Term[];
  let signs: ('+' | '-')[];
  let result: number;
  do {
    terms = [zeroTerm()];
    for (let i = 1; i < count; i++) terms.push(rng.chance(0.2) ? zeroTerm() : otherTerm());
    terms = rng.shuffle(terms);
    signs = terms.map((_, i) => (i === 0 ? '+' : rng.pick(['+', '+', '-'] as const)));
    result = terms.reduce((s, t, i) => s + (signs[i] === '-' ? -val(t) : val(t)), 0);
  } while (result < 0 || terms.every((t) => val(t) === 0));

  const expr = terms.map((t, i) => (i === 0 ? sym(t) : `${signs[i]} ${sym(t)}`)).join(' ');
  const evaluated = terms.map((t, i) => (i === 0 ? tn(val(t)) : `${signs[i]} ${tn(val(t))}`)).join(' ');
  const done = terms.filter((t) => t.op).map((t) => m(`${sym(t)} = ${tn(val(t))}`));
  return {
    prompt: `Calcule: ${M(expr)}`,
    answer: intAnswer(result),
    answerText: pn(result),
    answerDisplay: m(tn(result)),
    hint: `Primeiro as multiplicações e divisões, depois somas e subtrações. E lembre: ${m('a \\times 0 = 0')} e ${m('0 \\div a = 0')}.`,
    steps: [
      `Multiplicações e divisões primeiro: ${done.join('; ')}.`,
      `A expressão fica ${m(evaluated)}.`,
      `Resultado: ${m(`${evaluated} = ${tn(result)}`)}.`,
    ],
    data: { kind: 'zero-expr', terms, signs, result },
  };
}

/** Quantas dezenas (ou centenas) inteiras cabem em N. */
function wholeGroups(rng: Rng): Question {
  const n = withZeros(rng, rng.int(3, 5), 0.3);
  const k = n >= 1000 && rng.chance(0.5) ? 2 : 1;
  const size = pow10(k);
  const result = Math.floor(n / size);
  const name = k === 1 ? 'dezenas' : 'centenas';
  const s = String(n);
  return {
    prompt: `Quantas <b>${name} inteiras</b> há em ${m(tn(n))}?`,
    answer: intAnswer(result),
    answerText: pn(result),
    answerDisplay: m(`${tn(result)}\\text{ ${name}}`),
    hint: `Cada ${k === 1 ? 'dezena' : 'centena'} tem ${size} unidades. Cubra ${k === 1 ? 'o último algarismo' : 'os dois últimos algarismos'} do número e leia o que sobra.`,
    steps: [
      `Uma ${k === 1 ? 'dezena' : 'centena'} são ${m(String(size))} unidades, então a pergunta é ${m(`${tn(n)} \\div ${size}`)}, sem contar o resto.`,
      `Cobrindo ${k === 1 ? 'o último algarismo' : 'os dois últimos algarismos'} (${m(s.slice(-k))}), o que sobra à esquerda é ${m(tn(result))}.`,
      `Resposta: ${m(tn(result))} ${name} inteiras, pois ${m(`${tn(result)} \\times ${size} = ${tn(result * size)}`)} ${n % size === 0 ? 'e não sobra nada' : `e sobram só ${m(String(n % size))} ${n % size === 1 ? 'unidade' : 'unidades'}, que não completam outra ${k === 1 ? 'dezena' : 'centena'}`}.`,
    ],
    data: { kind: 'zero-groups', n, size, result },
  };
}

/** Escrever zeros à direita multiplica por 10, 100... */
function appendZeros(rng: Rng): Question {
  const n = rng.int(12, 9999);
  if (rng.chance(0.5)) {
    const after = n * 10;
    const correct = `Vira ${m(tn(after))}: fica 10 vezes maior`;
    return {
      prompt: `Escrevendo um ${m('0')} à direita de ${m(tn(n))}, o que acontece com o número?`,
      answer: choice(rng, correct, [
        'Nada: o zero não vale nada',
        `Vira ${m(tn(n + 10))}: aumenta 10`,
        `Vira ${m(tn(n * 100))}: fica 100 vezes maior`,
      ]),
      answerDisplay: correct,
      hint: 'O zero à direita empurra cada algarismo uma casa para a esquerda. E cada casa vale 10 vezes a anterior.',
      steps: [
        `Com o ${m('0')} novo, as unidades viram dezenas, as dezenas viram centenas, e assim por diante.`,
        `Cada algarismo passa a valer 10 vezes mais: ${m(`${tn(n)} \\times 10 = ${tn(after)}`)}.`,
        'O zero sozinho não vale nada, mas como "casa vazia" ele muda o valor de todos os outros algarismos.',
      ],
      data: { kind: 'zero-append', n, k: 1, mode: 'choice' },
    };
  }
  const k = rng.pick([1, 2]);
  const after = n * pow10(k);
  const result = after - n;
  return {
    prompt: `Escrevendo ${k === 1 ? 'um zero' : 'dois zeros'} à direita de ${m(tn(n))}, o número <b>aumenta</b> quanto?`,
    answer: intAnswer(result),
    answerText: pn(result),
    answerDisplay: m(tn(result)),
    hint: `Primeiro descubra o novo número: ${k === 1 ? 'um zero à direita multiplica por 10' : 'dois zeros à direita multiplicam por 100'}. Depois faça novo menos antigo.`,
    steps: [
      `O novo número é ${m(`${tn(n)} \\times ${pow10(k)} = ${tn(after)}`)}.`,
      `O aumento é ${m(`${tn(after)} - ${tn(n)} = ${tn(result)}`)}.`,
    ],
    data: { kind: 'zero-append', n, k, mode: 'increase', result },
  };
}

const zero: Generator = {
  id: 'zero',
  title: 'O zero',
  generate(level, rng) {
    if (level === 1) {
      const kind = rng.pick(['value', 'value', 'compose', 'compose', 'op', 'op', 'op'] as const);
      if (kind === 'value') return digitValue(rng, rng.int(3, 4));
      if (kind === 'compose') return compose(rng, rng.int(3, 4), false);
      return property(rng);
    }
    if (level === 2) {
      const kind = rng.pick(['from', 'from', 'to', 'cmp', 'cmp', 'div', 'div', 'expr'] as const);
      if (kind === 'from') return fromExpanded(rng, rng.int(4, 5));
      if (kind === 'to') return toExpanded(rng);
      if (kind === 'cmp') return compare(rng);
      if (kind === 'div') return division(rng, false);
      return expression(rng, 2, 20);
    }
    const kind = rng.pick(['value', 'compose', 'groups', 'groups', 'expr', 'expr', 'append', 'append', 'div'] as const);
    if (kind === 'value') return digitValue(rng, rng.int(5, 7));
    if (kind === 'compose') return compose(rng, rng.int(5, 7), true);
    if (kind === 'groups') return wholeGroups(rng);
    if (kind === 'expr') return expression(rng, 3, 50);
    if (kind === 'append') return appendZeros(rng);
    return division(rng, true);
  },
};

export default zero;
