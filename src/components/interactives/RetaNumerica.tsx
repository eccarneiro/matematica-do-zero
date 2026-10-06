'use client';

import { useRef, useState } from 'react';
import { MathText } from '@/components/MathText';
import { Interactive, Readout, Slider, Toggle } from './Interactive';

const MIN = -12;
const MAX = 12;
const W = 440;
const PAD = 16;
const Y = 112;
const x = (v: number) => PAD + ((v - MIN) / (MAX - MIN)) * (W - 2 * PAD);
const fmt = (v: number) => (v < 0 ? `-${-v}` : String(v));
const paren = (v: number) => (v < 0 ? `(${fmt(v)})` : fmt(v));

/** Reta numérica: soma e subtração de inteiros como saltos para a direita ou esquerda. */
export function RetaNumerica() {
  const [a, setA] = useState(-3);
  const [op, setOp] = useState<'+' | '-'>('+');
  const [b, setB] = useState(5);
  const svg = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const step = op === '+' ? b : -b;
  const r = a + step;
  const xa = x(a);
  const xr = x(r);
  const h = Math.min(44, 12 + Math.abs(xr - xa) * 0.25);
  const color = step >= 0 ? 'blue' : 'wrong';

  // Arrastar o ponto inicial pela reta.
  function moveTo(clientX: number) {
    const rect = svg.current!.getBoundingClientRect();
    const v = Math.round(MIN + (((clientX - rect.left) / rect.width) * W - PAD) / (W - 2 * PAD) * (MAX - MIN));
    setA(Math.max(-6, Math.min(6, v)));
  }

  const explanation =
    op === '-'
      ? `Subtrair ${paren(b)} é o mesmo que somar o oposto: \\(${fmt(a)} - ${paren(b)} = ${fmt(a)} + ${paren(-b)}\\).`
      : '';
  const move = step === 0 ? 'Não sai do lugar.' : `Anda ${Math.abs(step)} ${Math.abs(step) === 1 ? 'casa' : 'casas'} para a ${step > 0 ? 'direita' : 'esquerda'}.`;

  return (
    <Interactive title="Reta numérica" hint="Arraste o ponto azul ou use os controles.">
      <svg
        ref={svg}
        viewBox={`0 0 ${W} 156`}
        role="img"
        aria-label={`Reta numérica: ${fmt(a)} ${op} ${paren(b)} = ${fmt(r)}`}
        className="block h-auto w-full touch-none select-none"
        onPointerDown={(e) => {
          dragging.current = true;
          (e.target as Element).setPointerCapture?.(e.pointerId);
          moveTo(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
      >
        <defs>
          <marker id="rn-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" className={`f-${color}`} />
          </marker>
        </defs>
        <line x1={PAD - 10} x2={W - PAD + 10} y1={Y} y2={Y} className="s-ink2" strokeWidth={2} />
        {Array.from({ length: MAX - MIN + 1 }, (_, i) => MIN + i).map((v) => (
          <g key={v}>
            <line x1={x(v)} x2={x(v)} y1={Y - (v % 5 === 0 ? 9 : 5)} y2={Y + (v % 5 === 0 ? 9 : 5)} className={v === 0 ? 's-ink' : 's-ink2'} strokeWidth={v === 0 ? 2.5 : 1.3} />
            {(v % 5 === 0 || v === a || v === r) && (
              <text x={x(v)} y={Y + 28} textAnchor="middle" fontSize={v === a || v === r ? 17 : 13} fontWeight={v === a || v === r ? 600 : 400} className={v === r ? 'f-acc' : v === a ? 'f-blue' : 'f-ink2'}>
                {fmt(v)}
              </text>
            )}
          </g>
        ))}
        {step !== 0 && (
          <>
            <path d={`M${xa} ${Y - 8} Q ${(xa + xr) / 2} ${Y - 8 - h * 2} ${xr} ${Y - 8}`} fill="none" className={`s-${color}`} strokeWidth={3} markerEnd="url(#rn-arrow)" style={{ transition: 'd .3s ease' }} />
            <text x={(xa + xr) / 2} y={Y - 16 - h} textAnchor="middle" fontSize={17} fontWeight={600} className={`f-${color}`}>
              {step > 0 ? `+${step}` : fmt(step)}
            </text>
          </>
        )}
        <circle cx={xa} cy={Y} r={9} className="f-blue" style={{ cursor: 'grab' }} />
        <circle cx={xr} cy={Y} r={7} className="f-acc" />
      </svg>

      <div className="mt-2.5 grid gap-2.5">
        <Slider label="Começo" value={a} min={-6} max={6} onChange={setA} format={fmt} />
        <Toggle label="Operação" value={op} onChange={setOp} options={[{ value: '+', label: 'Somar (+)' }, { value: '-', label: 'Subtrair (−)' }]} />
        <Slider label="Número" value={b} min={-6} max={6} onChange={setB} format={fmt} />
      </div>
      <Readout>
        <MathText as="div" text={`\\(${fmt(a)} ${op} ${paren(b)} = ${fmt(r)}\\)`} className="text-[1.2rem]" />
        <p className="mt-1 text-[0.9rem] text-ink-2">
          {explanation && <MathText text={explanation} />} {move}
        </p>
      </Readout>
    </Interactive>
  );
}
