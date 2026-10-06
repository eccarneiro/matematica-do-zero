// Leitura e correção de respostas digitadas.
// Aceita formas equivalentes: 23/20 = 1,15 = 1.15 = 1 3/20, "15%", "R$ 12,50" etc.

import { R, eq, gcd, fromDecimal, div } from './rational.js';

function cleanup(str) {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[−–—]/g, '-') // sinais de menos tipográficos
    .replace(/r\$|reais|real/g, '')
    .replace(/[·×*]/g, '')
    .trim();
}

// Interpreta um número decimal escrito em pt-BR ou en; devolve todas as
// leituras possíveis (ex.: "1.500" pode ser 1,5 ou 1500).
function decimalCandidates(s) {
  if (/^[+-]?\d+$/.test(s)) return [R(parseInt(s, 10))];
  const neg = s.startsWith('-');
  const body = s.replace(/^[+-]/, '');
  const signed = (v) => (neg ? R(-v.n, v.d) : v);
  const hasComma = body.includes(',');
  const hasDot = body.includes('.');
  if (hasComma && hasDot) {
    // Padrão brasileiro: 1.234,56
    if (/^\d{1,3}(\.\d{3})+,\d+$/.test(body)) return [signed(fromDecimal(body.replace(/\./g, '').replace(',', '.')))];
    // Padrão americano: 1,234.56
    if (/^\d{1,3}(,\d{3})+\.\d+$/.test(body)) return [signed(fromDecimal(body.replace(/,/g, '')))];
    return [];
  }
  if (hasComma) {
    if (/^\d*,\d+$/.test(body)) return [signed(fromDecimal(body.replace(',', '.')))];
    return [];
  }
  if (hasDot) {
    if (/^\d{1,3}(\.\d{3}){2,}$/.test(body)) return [signed(R(parseInt(body.replace(/\./g, ''), 10)))];
    if (/^\d*\.\d+$/.test(body)) {
      const out = [signed(fromDecimal(body))];
      if (/^[1-9]\d{0,2}\.\d{3}$/.test(body)) out.push(signed(R(parseInt(body.replace('.', ''), 10))));
      return out;
    }
  }
  return [];
}

// Devolve uma lista de leituras: { value, form, raw? }.
export function parseNumber(input) {
  let s = cleanup(input);
  if (!s) return [];
  let percent = false;
  if (s.endsWith('%')) { percent = true; s = s.slice(0, -1).trim(); }

  let out = [];
  const mixed = s.match(/^(-?)(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixed) {
    const [, sign, w, n, d] = mixed;
    if (+d === 0) return [];
    const v = R((+w * +d + +n) * (sign ? -1 : 1), +d);
    out = [{ value: v, form: 'mixed' }];
  } else {
    s = s.replace(/\s+/g, '');
    const frac = s.match(/^([+-]?[\d.,]+)\/([+-]?[\d.,]+)$/);
    if (frac) {
      const nc = decimalCandidates(frac[1]);
      const dc = decimalCandidates(frac[2]);
      for (const n of nc) for (const d of dc) {
        if (d.n === 0) continue;
        const raw = n.d === 1 && d.d === 1 ? { n: n.n, d: d.n } : null;
        out.push({ value: div(n, d), form: 'fraction', raw });
      }
    } else {
      out = decimalCandidates(s).map((v) => ({ value: v, form: v.d === 1 ? 'integer' : 'decimal' }));
    }
  }
  if (percent) {
    // "15%" pode ser lido como 15 (quando a pergunta pede a porcentagem) ou 0,15.
    out = out.flatMap((c) => [{ ...c, form: 'percent' }, { ...c, value: div(c.value, R(100)), form: 'percent' }]);
  }
  return out;
}

// Raiz no formato a√b (aceita "√b", "3√2", "3 raiz 2", "3sqrt(2)").
export function parseRadical(input) {
  const s = cleanup(input).replace(/\s+/g, '').replace(/raiz(de)?|sqrt/g, '√');
  if (/^-?\d+$/.test(s)) return { coef: parseInt(s, 10), rad: 1 };
  const m = s.match(/^(-?)(\d*)√\(?(\d+)\)?$/);
  if (!m) return null;
  const coef = (m[2] ? parseInt(m[2], 10) : 1) * (m[1] ? -1 : 1);
  return { coef, rad: parseInt(m[3], 10) };
}

function isSquareFree(n) {
  for (let k = 2; k * k <= n; k++) if (n % (k * k) === 0) return false;
  return true;
}

// expected: ver formatos em js/generators/README.md
// Retorna { ok, message?, empty? }.
export function checkAnswer(expected, input) {
  if (expected.type === 'choice') {
    if (input === null || input === undefined || input === '') return { ok: false, empty: true };
    return { ok: Number(input) === expected.correct };
  }

  if (expected.type === 'fields') {
    const values = Array.isArray(input) ? input : [];
    if (values.some((v) => !String(v ?? '').trim())) return { ok: false, empty: true };
    const ok = expected.fields.every((f, i) => parseNumber(values[i]).some((c) => eq(c.value, f.value)));
    return { ok };
  }

  const text = String(input ?? '').trim();
  if (!text) return { ok: false, empty: true };

  if (expected.type === 'radical') {
    const r = parseRadical(text);
    if (!r) return { ok: false, message: 'Não entendi. Escreva no formato 3√2 (use o botão √).' };
    const same = Math.sign(r.coef) === Math.sign(expected.coef)
      && r.coef * r.coef * r.rad === expected.coef * expected.coef * expected.rad;
    if (!same) return { ok: false };
    if (!isSquareFree(r.rad)) return { ok: false, message: 'Equivalente! Mas ainda dá para tirar mais coisa de dentro da raiz.' };
    return { ok: true };
  }

  // type === 'number'
  const cands = parseNumber(text);
  if (!cands.length) return { ok: false, message: 'Não entendi esse número. Exemplos válidos: 12, -3, 1,25, 3/4.' };
  const hit = cands.find((c) => eq(c.value, expected.value));
  if (!hit) return { ok: false };
  if (expected.requireSimplified && hit.form === 'fraction' && hit.raw && gcd(hit.raw.n, hit.raw.d) > 1) {
    return { ok: false, message: 'Equivalente! Mas dá para simplificar mais essa fração.' };
  }
  return { ok: true };
}
