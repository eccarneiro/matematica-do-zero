'use client';

import { useState } from 'react';
import { MathText } from '@/components/MathText';
import { Interactive, Readout, Slider } from './Interactive';

const PLACES = ['centenas', 'dezenas', 'unidades'] as const;

/**
 * Quipu simplificado: uma corda pendente com grupos de nós para centenas,
 * dezenas e unidades. Posição sem nós = nada naquela casa.
 */
export function Quipu() {
  const [n, setN] = useState(305);
  const digits = String(n).padStart(3, '0').split('').map(Number);
  const W = 260;
  const top = 34;
  const slotY = [70, 140, 210];

  return (
    <Interactive title="Quipu (simplificado)" hint="Nas unidades os incas usavam nós de outro formato; aqui todos aparecem iguais.">
      <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,240px)_1fr]">
        <svg viewBox={`0 0 ${W} 250`} className="mx-auto block h-auto w-full max-w-[240px]" role="img" aria-label={`Quipu representando ${n}`}>
          {/* corda principal */}
          <path d={`M10 ${top} Q ${W / 2} ${top - 18} ${W - 10} ${top}`} fill="none" strokeWidth={6} strokeLinecap="round" className="s-ink2" />
          {/* corda pendente */}
          <line x1={W / 2} x2={W / 2} y1={top - 9} y2={240} strokeWidth={4} strokeLinecap="round" className="s-ink2" />
          {slotY.map((y, p) => (
            <g key={p}>
              <text x={W / 2 + 46} y={y + 4} fontSize={12} className="f-ink2">{PLACES[p]}</text>
              {digits[p] === 0 ? (
                <rect x={W / 2 - 16} y={y - 22} width={32} height={44} rx={8} fill="none" strokeDasharray="4 4" strokeWidth={1.5} className="s-acc" />
              ) : (
                Array.from({ length: digits[p] }, (_, k) => (
                  <circle key={k} cx={W / 2} cy={y - (digits[p] - 1) * 4 + k * 8} r={5.5} className="f-acc" />
                ))
              )}
            </g>
          ))}
        </svg>
        <div>
          <Slider label="Número" value={n} min={0} max={999} onChange={setN} />
          <Readout>
            <MathText as="div" text={`\\(${n} = ${digits[0]}\\cdot 100 + ${digits[1]}\\cdot 10 + ${digits[2]}\\)`} className="text-[1.15rem]" />
            <p className="mt-1 text-[0.9rem] text-ink-2">
              {digits.includes(0) && n > 0
                ? 'O espaço tracejado não tem nós: nada naquela casa. O vazio já tinha um lugar.'
                : 'Cada grupo de nós conta quantas centenas, dezenas e unidades.'}
            </p>
          </Readout>
        </div>
      </div>
    </Interactive>
  );
}
