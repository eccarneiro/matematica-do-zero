'use client';

import { useState } from 'react';
import { MathText } from '@/components/MathText';
import { Interactive, Readout, Slider } from './Interactive';

const W = 120;
const LEVEL_H = 78;

/** Um "algarismo" maia (0 a 19): pontos valem 1, barras valem 5, a concha é o zero. */
function Glyph({ d, y }: { d: number; y: number }) {
  if (d === 0) {
    const cx = W / 2;
    const cy = y + LEVEL_H / 2;
    return (
      <g aria-hidden>
        <ellipse cx={cx} cy={cy} rx={30} ry={15} strokeWidth={2.5} className="f-surface2 s-acc" />
        <path d={`M${cx - 22} ${cy - 3} Q ${cx} ${cy - 13} ${cx + 22} ${cy - 3}`} fill="none" strokeWidth={2} className="s-acc" />
        <path d={`M${cx - 20} ${cy + 5} Q ${cx} ${cy - 4} ${cx + 20} ${cy + 5}`} fill="none" strokeWidth={2} className="s-acc" />
      </g>
    );
  }
  const bars = Math.floor(d / 5);
  const dots = d % 5;
  const barH = 9;
  const gap = 5;
  const stackH = bars * (barH + gap) + (dots ? 14 : 0);
  const y0 = y + (LEVEL_H - stackH) / 2;
  return (
    <g aria-hidden>
      {Array.from({ length: dots }, (_, k) => (
        <circle key={`d${k}`} cx={W / 2 + (k - (dots - 1) / 2) * 16} cy={y0 + 5} r={5.5} className="f-acc" />
      ))}
      {Array.from({ length: bars }, (_, k) => (
        <rect key={`b${k}`} x={W / 2 - 34} y={y0 + (dots ? 14 : 0) + k * (barH + gap)} width={68} height={barH} rx={4} className="f-blue" />
      ))}
    </g>
  );
}

/** Números maias em dois andares: o de cima conta vintenas, o de baixo, unidades. */
export function NumeroMaia() {
  const [n, setN] = useState(20);
  const q = Math.floor(n / 20);
  const r = n % 20;
  const levels = q > 0 ? [q, r] : [r];
  const h = levels.length * LEVEL_H + 8;

  return (
    <Interactive title="Números maias" hint="Escreve-se de baixo para cima: o andar de baixo vale 1, o de cima vale 20.">
      <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,160px)_1fr]">
        <svg viewBox={`0 0 ${W + 70} ${2 * LEVEL_H + 8}`} className="mx-auto block h-auto w-full max-w-[190px]" role="img" aria-label={`Número maia representando ${n}`}>
          <g transform={`translate(0 ${2 * LEVEL_H + 8 - h})`}>
            {levels.map((d, i) => (
              <g key={i}>
                <rect x={2} y={i * LEVEL_H + 4} width={W - 4} height={LEVEL_H - 6} rx={10} fill="none" strokeDasharray="4 4" strokeWidth={1.2} className="s-line" />
                <Glyph d={d} y={i * LEVEL_H + 4} />
                <text x={W + 6} y={i * LEVEL_H + LEVEL_H / 2 + 8} fontSize={13} className="f-ink2">
                  {levels.length === 2 && i === 0 ? `${d} × 20` : `${d} × 1`}
                </text>
              </g>
            ))}
          </g>
        </svg>
        <div>
          <Slider label="Número" value={n} min={0} max={399} onChange={setN} />
          <Readout>
            <MathText as="div" text={q > 0 ? `\\(${n} = ${q} \\cdot 20 + ${r}\\)` : `\\(${n} = ${r}\\)`} className="text-[1.15rem]" />
            <p className="mt-1 text-[0.9rem] text-ink-2">
              {q > 0 && r === 0
                ? 'A concha embaixo diz "nenhuma unidade" e segura o outro andar no lugar das vintenas.'
                : 'Pontos valem 1 e barras valem 5. Com 20, sobe-se um andar.'}
            </p>
          </Readout>
        </div>
      </div>
    </Interactive>
  );
}
