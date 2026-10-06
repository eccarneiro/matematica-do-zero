'use client';

import { useState } from 'react';
import { MathText } from '@/components/MathText';
import { R, mul, texFrac, toDecimalString, type Rational } from '@/lib/math/rational';
import { Interactive, Readout, Slider, Toggle } from './Interactive';

const TOTALS = ['80', '200', '350', '1200'] as const;
type Mode = 'parte' | 'aumento' | 'desconto';

const W = 400;
const PAD = 18;
const BAR_Y = 38;
const BAR_H = 34;
const MAX = 200;
const x = (p: number) => PAD + (p / MAX) * (W - 2 * PAD);
const TICKS = [0, 25, 50, 75, 100, 150, 200];

/** Número em LaTeX com vírgula decimal e ponto de milhar. */
function tex(v: Rational): string {
  const s = toDecimalString(v) ?? '';
  const [i, f] = s.split(',');
  return i.replace(/\B(?=(\d{3})+(?!\d))/g, '{.}') + (f ? `{,}${f}` : '');
}
/** Número em texto, para os rótulos do desenho. */
const plain = (v: Rational) => tex(v).replace(/\{(.)\}/g, '$1');

/** Barra que representa 100% de um total: parte, aumento e desconto. */
export function BarraPorcentagem() {
  const [total, setTotal] = useState<(typeof TOTALS)[number]>('200');
  const [p, setP] = useState(25);
  const [mode, setMode] = useState<Mode>('parte');
  const n = Number(total);
  const max = mode === 'desconto' ? 100 : MAX;
  const pc = Math.min(p, max);

  const frac = R(pc, 100);
  const part = mul(R(n), frac);
  const factor = R(100 + (mode === 'desconto' ? -pc : pc), 100);
  const result = mode === 'parte' ? part : mul(R(n), factor);
  // Até onde a barra colorida chega, em %.
  const end = mode === 'parte' ? pc : mode === 'aumento' ? 100 + pc : 100 - pc;

  const fracTex = texFrac(frac);
  const simple = frac.d !== 100 && frac.n !== 0 && frac.d !== 1 ? ` = ${fracTex}` : '';
  const sign = mode === 'aumento' ? '+' : '-';
  const formula =
    mode === 'parte'
      ? `\\(${pc}\\%\\text{ de }${tex(R(n))} = ${tex(result)}\\)`
      : `\\(${tex(R(n))} \\cdot ${tex(factor)} = ${tex(result)}\\)`;
  const equiv =
    mode === 'parte'
      ? `\\(${pc}\\% = \\frac{${pc}}{100}${simple} = ${tex(frac)}\\)`
      : `\\(100\\% ${sign} ${pc}\\% = ${end}\\% = ${tex(factor)}\\)`;
  const note =
    mode === 'parte'
      ? pc > 100
        ? 'Mais de 100% é mais do que o total inteiro.'
        : `É a parte pintada da barra: ${pc} de cada 100.`
      : mode === 'aumento'
        ? `O valor novo é ${end}% do original: cresceu ${plain(part)}.`
        : `Você paga ${end}% do original: o desconto é de ${plain(part)}.`;

  return (
    <Interactive title="Barra de porcentagem" hint="A barra com contorno é o total: 100%.">
      <svg
        viewBox={`0 0 ${W} 132`}
        role="img"
        aria-label={`${pc}% de ${n}: resultado ${plain(result)}`}
        className="block h-auto w-full select-none"
      >
        {/* trilho de 0% a 200% */}
        <rect x={x(0)} y={BAR_Y} width={x(MAX) - x(0)} height={BAR_H} rx={6} className="f-surface2" />

        {mode === 'parte' && pc > 0 && <rect x={x(0)} y={BAR_Y} width={x(pc) - x(0)} height={BAR_H} rx={6} className="f-acc" />}
        {mode === 'aumento' && (
          <>
            <rect x={x(0)} y={BAR_Y} width={x(100) - x(0)} height={BAR_H} rx={6} className="f-blue" />
            {pc > 0 && <rect x={x(100)} y={BAR_Y} width={x(100 + pc) - x(100)} height={BAR_H} className="f-acc" />}
          </>
        )}
        {mode === 'desconto' && (
          <>
            {pc < 100 && <rect x={x(0)} y={BAR_Y} width={x(100 - pc) - x(0)} height={BAR_H} rx={6} className="f-blue" />}
            {pc > 0 && (
              <rect x={x(100 - pc)} y={BAR_Y} width={x(100) - x(100 - pc)} height={BAR_H} className="f-acc-soft s-acc" strokeWidth={1.5} strokeDasharray="4 3" />
            )}
          </>
        )}

        {/* o total (100%) */}
        <rect x={x(0)} y={BAR_Y} width={x(100) - x(0)} height={BAR_H} rx={6} fill="none" className="s-ink" strokeWidth={2.5} />

        {/* marcador do valor atual */}
        <line x1={x(end)} x2={x(end)} y1={BAR_Y - 8} y2={BAR_Y + BAR_H + 4} className="s-ink" strokeWidth={2} />
        <text x={Math.min(Math.max(x(end), 62), W - 62)} y={BAR_Y - 13} textAnchor="middle" fontSize={15} fontWeight={600} className="f-acc">
          {end}% = {plain(result)}
        </text>

        {TICKS.map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={BAR_Y + BAR_H} y2={BAR_Y + BAR_H + (t % 50 === 0 ? 9 : 6)} className="s-ink2" strokeWidth={1.3} />
            <text x={x(t)} y={BAR_Y + BAR_H + 23} textAnchor="middle" fontSize={13} fontWeight={t === 100 ? 600 : 400} className={t === 100 ? 'f-ink' : 'f-ink2'}>
              {t}%
            </text>
          </g>
        ))}

        {/* chave sob o total */}
        <path d={`M${x(0)} ${BAR_Y + BAR_H + 32} v6 H${x(100)} v-6`} fill="none" className="s-ink2" strokeWidth={1.3} />
        <text x={(x(0) + x(100)) / 2} y={BAR_Y + BAR_H + 56} textAnchor="middle" fontSize={14} className="f-ink">
          total = {plain(R(n))}
        </text>
      </svg>

      <div className="mt-2.5 grid gap-2.5">
        <Toggle label="Modo" value={mode} onChange={setMode} options={[{ value: 'parte', label: 'Parte' }, { value: 'aumento', label: 'Aumento' }, { value: 'desconto', label: 'Desconto' }]} />
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="min-w-[7.5em] text-[0.9rem] text-ink-2">Total (100%)</span>
          <Toggle label="Total" value={total} onChange={setTotal} options={TOTALS.map((t) => ({ value: t, label: plain(R(Number(t))) }))} />
        </div>
        <Slider label="Porcentagem" value={pc} min={0} max={max} onChange={setP} format={(v) => `${v}%`} />
      </div>
      <Readout>
        <MathText as="div" text={formula} className="text-[1.1rem]" />
        <MathText as="div" text={equiv} className="mt-1 text-[0.95rem] text-ink-2" />
        <p className="mt-1 text-[0.9rem] text-ink-2">{note}</p>
      </Readout>
    </Interactive>
  );
}
