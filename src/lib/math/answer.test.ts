import { describe, expect, it } from 'vitest';
import { checkAnswer, parseRadical, type ExpectedAnswer } from './answer';
import { R } from './rational';

const num = (n: number, d = 1, extra: Partial<Extract<ExpectedAnswer, { type: 'number' }>> = {}): ExpectedAnswer => ({
  type: 'number',
  value: R(n, d),
  ...extra,
});
const status = (e: ExpectedAnswer, input: Parameters<typeof checkAnswer>[1]) => checkAnswer(e, input).status;

describe('respostas numéricas equivalentes', () => {
  it('aceita fração, decimal com vírgula, decimal com ponto e número misto', () => {
    for (const s of ['23/20', '1,15', '1.15', '1 3/20', '46/40', ' 1,150 ']) {
      expect(status(num(23, 20), s), s).toBe('right');
    }
  });

  it('recusa valores diferentes', () => {
    expect(status(num(23, 20), '1,5')).toBe('wrong');
    expect(status(num(23, 20), '20/23')).toBe('wrong');
  });

  it('entende negativos, inclusive com sinal tipográfico', () => {
    expect(status(num(-7), '-7')).toBe('right');
    expect(status(num(-7), '−7')).toBe('right');
    expect(status(num(-3, 4), '-0,75')).toBe('right');
    expect(status(num(-3, 4), '-3/4')).toBe('right');
    expect(status(num(-3, 4), '3/-4')).toBe('right');
  });

  it('entende separador de milhar brasileiro e o caso ambíguo "1.500"', () => {
    expect(status(num(1234567), '1.234.567')).toBe('right');
    expect(status(num(123456, 100), '1.234,56')).toBe('right');
    expect(status(num(1500), '1.500')).toBe('right');
    expect(status(num(3, 2), '1.500')).toBe('right');
  });

  it('aceita porcentagem como número ou como fração de 100', () => {
    expect(status(num(15), '15%')).toBe('right');
    expect(status(num(15, 100), '15%')).toBe('right');
    expect(status(num(15, 100), '0,15')).toBe('right');
  });

  it('ignora R$ e reais', () => {
    expect(status(num(1250, 100), 'R$ 12,50')).toBe('right');
    expect(status(num(30), '30 reais')).toBe('right');
  });

  it('pede simplificação quando exigido, sem contar como erro', () => {
    const e = num(2, 3, { requireSimplified: true });
    expect(status(e, '2/3')).toBe('right');
    expect(status(e, '4/6')).toBe('retry');
    expect(status(num(2, 3), '4/6')).toBe('right');
  });

  it('trata vazio e texto ilegível', () => {
    expect(status(num(1), '')).toBe('empty');
    expect(status(num(1), '   ')).toBe('empty');
    expect(status(num(1), 'abc')).toBe('retry');
    expect(status(num(1), '1/0')).toBe('retry');
  });
});

describe('radicais', () => {
  const e: ExpectedAnswer = { type: 'radical', coef: 6, rad: 2 };
  it('lê vários formatos', () => {
    expect(parseRadical('6√2')).toEqual({ coef: 6, rad: 2 });
    expect(parseRadical('√5')).toEqual({ coef: 1, rad: 5 });
    expect(parseRadical('6 raiz de 2')).toEqual({ coef: 6, rad: 2 });
    expect(parseRadical('6sqrt(2)')).toEqual({ coef: 6, rad: 2 });
    expect(parseRadical('-2√3')).toEqual({ coef: -2, rad: 3 });
  });
  it('aceita a forma simplificada e pede para simplificar as outras', () => {
    expect(status(e, '6√2')).toBe('right');
    expect(status(e, '√72')).toBe('retry');
    expect(status(e, '3√8')).toBe('retry');
    expect(status(e, '2√6')).toBe('wrong');
  });
  it('aceita inteiro quando a raiz é exata', () => {
    expect(status({ type: 'radical', coef: 7, rad: 1 }, '7')).toBe('right');
  });
});

describe('múltipla escolha e campos', () => {
  it('compara o índice escolhido', () => {
    const e: ExpectedAnswer = { type: 'choice', options: ['a', 'b'], correct: 1 };
    expect(status(e, 1)).toBe('right');
    expect(status(e, 0)).toBe('wrong');
    expect(status(e, null)).toBe('empty');
  });
  it('confere todos os campos', () => {
    const e: ExpectedAnswer = { type: 'fields', fields: [{ label: 'q', value: R(7) }, { label: 'r', value: R(2) }] };
    expect(status(e, ['7', '2'])).toBe('right');
    expect(status(e, ['7', '3'])).toBe('wrong');
    expect(status(e, ['7', ''])).toBe('empty');
  });
});
