'use client';

import { useState } from 'react';
import { MathText } from '@/components/MathText';
import { Interactive, Readout, Slider } from './Interactive';

const C = 1000;
const W = 400;
const H = 210;
const L = 48; // margem esquerda (rótulos do eixo)
const R_ = 12;
const T = 14;
const B = 30;

/** Dinheiro no padrão brasileiro, com centavos. */
const money = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** Número curto para o eixo (1 mil, 2,5 mil…). */
const short = (v: number) => (v >= 1000 ? `${(v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil` : String(v));
/** Número em LaTeX com vírgula decimal e ponto de milhar. */
const tex = (s: string) => s.replace(/\./g, '{.}').replace(/,/g, '{,}');

/** Escolhe um passo "redondo" para as linhas de grade. */
function niceStep(max: number) {
  const raw = max / 4;
  const p = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => s >= raw)!;
}

/** Compara juros simples e compostos sobre R$ 1.000 ao longo dos anos. */
export function JurosCompostos() {
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(20);
  const i = rate / 100;

  const simple = (n: number) => C * (1 + i * n);
  const compound = (n: number) => C * (1 + i) ** n;
  const ms = simple(years);
  const mc = compound(years);

  const step = niceStep(mc);
  const top = Math.ceil(mc / step) * step;
  const x = (n: number) => L + (n / years) * (W - L - R_);
  const y = (v: number) => T + (1 - v / top) * (H - T - B);
  const path = (f: (n: number) => number) => {
    const pts: string[] = [];
    const k = Math.max(years * 4, 8);
    for (let j = 0; j <= k; j++) {
      const n = (j / k) * years;
      pts.push(`${j ? 'L' : 'M'}${x(n).toFixed(1)} ${y(f(n)).toFixed(1)}`);
    }
    return pts.join(' ');
  };
  const grid = Array.from({ length: Math.round(top / step) + 1 }, (_, k) => k * step);
  const xTicks = [0, Math.round(years / 2), years].filter((v, k, a) => a.indexOf(v) === k);

  const doubling = Math.log(2) / Math.log(1 + i);
  const rule = 72 / rate;

  return (
    <Interactive title="Simples × compostos" hint="Capital inicial: R$ 1.000. Mude a taxa e o tempo.">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Depois de ${years} anos a ${rate}% ao ano: juros simples R$ ${money(ms)}, juros compostos R$ ${money(mc)}`} className="block h-auto w-full select-none">
        {grid.map((g) => (
          <g key={g}>
            <line x1={L} x2={W - R_} y1={y(g)} y2={y(g)} className="s-line" strokeWidth={1} />
            <text x={L - 6} y={y(g) + 4} textAnchor="end" fontSize={11} className="f-ink2">
              {short(g)}
            </text>
          </g>
        ))}
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 10} textAnchor={t === 0 ? 'start' : t === years ? 'end' : 'middle'} fontSize={11} className="f-ink2">
            {t} {t === years ? 'anos' : ''}
          </text>
        ))}
        <path d={path(simple)} fill="none" className="s-blue" strokeWidth={2.5} strokeLinecap="round" />
        <path d={path(compound)} fill="none" className="s-acc" strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={x(years)} cy={y(ms)} r={4.5} className="f-blue" />
        <circle cx={x(years)} cy={y(mc)} r={4.5} className="f-acc" />
      </svg>

      <div className="mt-1 flex flex-wrap justify-center gap-x-5 gap-y-1 text-[0.85rem] font-bold text-ink-2">
        <span className="flex items-center gap-1.5"><svg width="20" height="6" aria-hidden><rect width="20" height="4" y="1" rx="2" className="f-blue" /></svg>Juros simples</span>
        <span className="flex items-center gap-1.5"><svg width="20" height="6" aria-hidden><rect width="20" height="4" y="1" rx="2" className="f-acc" /></svg>Juros compostos</span>
      </div>

      <div className="mt-3 grid gap-2.5">
        <Slider label="Taxa ao ano" value={rate} min={1} max={20} onChange={setRate} format={(v) => `${v}%`} />
        <Slider label="Anos" value={years} min={1} max={40} onChange={setYears} />
      </div>
      <Readout>
        <MathText as="div" className="text-[0.95rem]" text={`Simples: \\(1{.}000\\cdot(1 + ${years}\\cdot ${tex(String(i).replace('.', ','))}) = ${tex(money(ms))}\\)`} />
        <MathText as="div" className="mt-1 text-[0.95rem]" text={`Compostos: \\(1{.}000\\cdot ${tex((1 + i).toFixed(2).replace('.', ','))}^{${years}} \\approx ${tex(money(mc))}\\)`} />
        <p className="mt-1.5 text-[0.88rem] text-ink-2">
          Regra do 72: dobra em cerca de {rule.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} anos. Conta exata: {doubling.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} anos.
        </p>
      </Readout>
    </Interactive>
  );
}
