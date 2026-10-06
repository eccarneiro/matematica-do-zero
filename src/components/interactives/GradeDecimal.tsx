'use client';

import { useRef, useState } from 'react';
import { MathText } from '@/components/MathText';
import { gcd } from '@/lib/math/rational';
import { Interactive, Readout, Slider } from './Interactive';

const CELL = 30;
const GAP = 2;
const PAD = 4;
const SIZE = PAD * 2 + CELL * 10 + GAP * 9;
const pos = (k: number) => PAD + k * (CELL + GAP);
const PRESETS = [10, 25, 50, 75];

/** Valor em centésimos (0 a 100) escrito com duas casas: 37 → "0,37". */
const dec2 = (v: number) => `${Math.floor(v / 100)},${String(v % 100).padStart(2, '0')}`;
/** Mesmo valor sem zeros sobrando à direita: 30 → "0,3", 100 → "1". */
const decShort = (v: number) => dec2(v).replace(/0+$/, '').replace(/,$/, '');
const tex = (s: string) => s.replace(',', '{,}');

/** Grade 10×10: cada coluna é um décimo e cada quadradinho é um centésimo. */
export function GradeDecimal() {
  const [v, setV] = useState(37);
  const svg = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const cols = Math.floor(v / 10);
  const rest = v % 10;

  // Toque/arraste: a grade é preenchida coluna por coluna, de cima para baixo.
  function paintAt(clientX: number, clientY: number, tap: boolean) {
    const rect = svg.current!.getBoundingClientRect();
    const sx = ((clientX - rect.left) / rect.width) * SIZE - PAD;
    const sy = ((clientY - rect.top) / rect.height) * SIZE - PAD;
    const c = Math.max(0, Math.min(9, Math.floor(sx / (CELL + GAP))));
    const r = Math.max(0, Math.min(9, Math.floor(sy / (CELL + GAP))));
    const k = c * 10 + r + 1;
    // Tocar no último quadradinho pintado apaga ele.
    setV(tap && k === v ? k - 1 : k);
  }

  const short = decShort(v);
  const full = dec2(v);
  const g = gcd(v, 100) || 100;
  const fracs = `\\frac{${v}}{100}` + (g > 1 && v > 0 && v < 100 ? ` = \\frac{${v / g}}{${100 / g}}` : '');
  const main = `${tex(short)}${short !== full ? ` = ${tex(full)}` : ''} = ${fracs}`;

  const parts: string[] = [];
  if (v === 100) parts.push('10 décimos = 1 inteiro');
  else {
    if (cols) parts.push(`${cols} ${cols === 1 ? 'décimo' : 'décimos'} (${cols} ${cols === 1 ? 'coluna' : 'colunas'})`);
    if (rest) parts.push(`${rest} ${rest === 1 ? 'centésimo' : 'centésimos'}`);
    if (!parts.length) parts.push('nada pintado');
  }

  return (
    <Interactive title="Grade decimal" hint="Toque ou arraste na grade, ou use o controle. A grade inteira vale 1.">
      <svg
        ref={svg}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`Grade com ${v} de 100 quadradinhos pintados: ${short}`}
        className="mx-auto block h-auto w-full max-w-[340px] cursor-pointer touch-none select-none"
        onPointerDown={(e) => {
          dragging.current = true;
          (e.target as Element).setPointerCapture?.(e.pointerId);
          paintAt(e.clientX, e.clientY, true);
        }}
        onPointerMove={(e) => dragging.current && paintAt(e.clientX, e.clientY, false)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        {Array.from({ length: 10 }, (_, c) => (
          <g key={c}>
            {/* Coluna completa = um décimo: ganha um contorno próprio. */}
            {c < cols && (
              <rect x={pos(c) - 1.5} y={PAD - 1.5} width={CELL + 3} height={SIZE - 2 * PAD + 3} rx={5} className="s-acc" fill="none" strokeWidth={2} />
            )}
            {Array.from({ length: 10 }, (_, r) => {
              const k = c * 10 + r;
              const cls = k >= v ? 'f-surface2' : c < cols ? 'f-acc' : 'f-blue';
              return <rect key={r} x={pos(c)} y={pos(r)} width={CELL} height={CELL} rx={3} className={cls} style={{ transition: 'fill .15s' }} />;
            })}
          </g>
        ))}
      </svg>

      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[0.85rem] text-ink-2">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm bg-accent" /> coluna = <MathText text="\(0{,}1\)" />
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm" style={{ background: 'var(--blue)' }} /> quadradinho = <MathText text="\(0{,}01\)" />
        </span>
      </div>

      <div className="mt-3 grid gap-2.5">
        <Slider label="Centésimos" value={v} min={0} max={100} onChange={setV} />
        <div className="flex flex-wrap gap-2" aria-label="Valores prontos">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setV(p)}
              className={`min-h-10 min-w-14 cursor-pointer rounded-full border-[1.5px] px-3 py-1.5 text-[0.92rem] tabular-nums ${v === p ? 'border-accent bg-accent-soft font-medium text-accent' : 'border-line bg-surface'}`}
            >
              {decShort(p)}
            </button>
          ))}
        </div>
      </div>

      <Readout>
        <MathText as="div" text={`\\(${main}\\)`} className="text-[1.2rem]" />
        <p className="mt-1 text-[0.9rem] text-ink-2">{parts.join(' + ')}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2 text-[0.9rem]">
          <span className="rounded-full bg-surface px-3 py-1">
            💰 R$ {full}
          </span>
          <span className="rounded-full bg-surface px-3 py-1">
            {v}%
          </span>
        </div>
      </Readout>
    </Interactive>
  );
}
