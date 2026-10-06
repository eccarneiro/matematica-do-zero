// Leitura e correção de respostas digitadas.
// Aceita formas equivalentes: 23/20 = 1,15 = 1.15 = 1 3/20, "15%", "R$ 12,50", "3√2".

import { R, div, eq, gcd, fromDecimalString, type Rational } from './rational';

export type ExpectedAnswer =
  | { type: 'number'; value: Rational; requireSimplified?: boolean }
  | { type: 'radical'; coef: number; rad: number }
  | { type: 'choice'; options: string[]; correct: number }
  | { type: 'fields'; fields: { label: string; value: Rational }[] };

export type UserInput = string | string[] | number | null;

export type CheckResult =
  | { status: 'empty' }
  | { status: 'right' }
  | { status: 'wrong' }
  /** Resposta equivalente mas fora do formato pedido, ou ilegível: não conta como erro. */
  | { status: 'retry'; message: string };

type Reading = { value: Rational; form: 'integer' | 'decimal' | 'fraction' | 'mixed' | 'percent'; raw?: { n: number; d: number } };

function cleanup(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/[−–—]/g, '-') // sinais de menos tipográficos
    .replace(/r\$|reais|real/g, '')
    .replace(/[·×*]/g, '')
    .trim();
}

/**
 * Lê um número decimal escrito no padrão brasileiro ou americano e devolve
 * todas as leituras possíveis (ex.: "1.500" pode ser 1,5 ou 1500).
 */
function decimalReadings(s: string): Rational[] {
  if (/^[+-]?\d+$/.test(s)) return [R(parseInt(s, 10))];
  const neg = s.startsWith('-');
  const body = s.replace(/^[+-]/, '');
  const signed = (v: Rational) => (neg ? R(-v.n, v.d) : v);
  const hasComma = body.includes(',');
  const hasDot = body.includes('.');
  if (hasComma && hasDot) {
    if (/^\d{1,3}(\.\d{3})+,\d+$/.test(body)) return [signed(fromDecimalString(body.replace(/\./g, '').replace(',', '.')))];
    if (/^\d{1,3}(,\d{3})+\.\d+$/.test(body)) return [signed(fromDecimalString(body.replace(/,/g, '')))];
    return [];
  }
  if (hasComma) {
    return /^\d*,\d+$/.test(body) ? [signed(fromDecimalString(body.replace(',', '.')))] : [];
  }
  if (hasDot) {
    if (/^\d{1,3}(\.\d{3}){2,}$/.test(body)) return [signed(R(parseInt(body.replace(/\./g, ''), 10)))];
    if (/^\d*\.\d+$/.test(body)) {
      const out = [signed(fromDecimalString(body))];
      if (/^[1-9]\d{0,2}\.\d{3}$/.test(body)) out.push(signed(R(parseInt(body.replace('.', ''), 10))));
      return out;
    }
  }
  return [];
}

export function parseNumber(input: string): Reading[] {
  let s = cleanup(input);
  if (!s) return [];
  let percent = false;
  if (s.endsWith('%')) {
    percent = true;
    s = s.slice(0, -1).trim();
  }

  let out: Reading[] = [];
  const mixed = s.match(/^(-?)(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixed) {
    const [, sign, w, n, d] = mixed;
    if (+d === 0) return [];
    out = [{ value: R((+w * +d + +n) * (sign ? -1 : 1), +d), form: 'mixed' }];
  } else {
    s = s.replace(/\s+/g, '');
    const frac = s.match(/^([+-]?[\d.,]+)\/([+-]?[\d.,]+)$/);
    if (frac) {
      for (const n of decimalReadings(frac[1])) {
        for (const d of decimalReadings(frac[2])) {
          if (d.n === 0) continue;
          const raw = n.d === 1 && d.d === 1 ? { n: n.n, d: d.n } : undefined;
          out.push({ value: div(n, d), form: 'fraction', raw });
        }
      }
    } else {
      out = decimalReadings(s).map((v) => ({ value: v, form: v.d === 1 ? 'integer' : 'decimal' }));
    }
  }
  if (percent) {
    // "15%" vale 15 quando a pergunta pede a porcentagem, e 0,15 quando pede o número.
    out = out.flatMap((c) => [
      { ...c, form: 'percent' as const },
      { ...c, value: div(c.value, R(100)), form: 'percent' as const },
    ]);
  }
  return out;
}

/** Raiz no formato a√b. Aceita "√b", "3√2", "3 raiz de 2", "3sqrt(2)" e inteiros. */
export function parseRadical(input: string): { coef: number; rad: number } | null {
  const s = cleanup(input).replace(/\s+/g, '').replace(/raiz(de)?|sqrt/g, '√');
  if (/^-?\d+$/.test(s)) return { coef: parseInt(s, 10), rad: 1 };
  const m = s.match(/^(-?)(\d*)√\(?(\d+)\)?$/);
  if (!m) return null;
  const coef = (m[2] ? parseInt(m[2], 10) : 1) * (m[1] ? -1 : 1);
  return { coef, rad: parseInt(m[3], 10) };
}

export function isSquareFree(n: number): boolean {
  for (let k = 2; k * k <= n; k++) if (n % (k * k) === 0) return false;
  return true;
}

const isBlank = (v: unknown) => v === null || v === undefined || String(v).trim() === '';

export function checkAnswer(expected: ExpectedAnswer, input: UserInput): CheckResult {
  switch (expected.type) {
    case 'choice':
      if (isBlank(input)) return { status: 'empty' };
      return { status: Number(input) === expected.correct ? 'right' : 'wrong' };

    case 'fields': {
      const values = Array.isArray(input) ? input : [];
      if (values.length < expected.fields.length || values.some(isBlank)) return { status: 'empty' };
      const ok = expected.fields.every((f, i) => parseNumber(values[i]).some((c) => eq(c.value, f.value)));
      return { status: ok ? 'right' : 'wrong' };
    }

    case 'radical': {
      if (isBlank(input)) return { status: 'empty' };
      const r = parseRadical(String(input));
      if (!r) return { status: 'retry', message: 'Não entendi. Escreva no formato 3√2 (use o botão √).' };
      const same =
        Math.sign(r.coef) === Math.sign(expected.coef) &&
        r.coef * r.coef * r.rad === expected.coef * expected.coef * expected.rad;
      if (!same) return { status: 'wrong' };
      if (!isSquareFree(r.rad)) {
        return { status: 'retry', message: 'Equivalente! Mas ainda dá para tirar mais coisa de dentro da raiz.' };
      }
      return { status: 'right' };
    }

    case 'number': {
      if (isBlank(input)) return { status: 'empty' };
      const readings = parseNumber(String(input));
      if (!readings.length) {
        return { status: 'retry', message: 'Não entendi esse número. Exemplos válidos: 12, -3, 1,25, 3/4.' };
      }
      const hit = readings.find((c) => eq(c.value, expected.value));
      if (!hit) return { status: 'wrong' };
      if (expected.requireSimplified && hit.form === 'fraction' && hit.raw && gcd(hit.raw.n, hit.raw.d) > 1) {
        return { status: 'retry', message: 'Equivalente! Mas dá para simplificar mais essa fração.' };
      }
      return { status: 'right' };
    }
  }
}
