'use client';

import { useState } from 'react';
import { MathText } from '@/components/MathText';
import { Interactive, Readout, Slider, Toggle } from './Interactive';

const W = 340;
const LEFT = 40;
const TOP = 34;
const AREA_W = W - LEFT - 12;
const AREA_H = 250;

type Mode = 'mult' | 'div';

/** Multiplicação como área de um retângulo; divisão como repartir em grupos, com resto. */
export function AreaMultiplicacao() {
  const [mode, setMode] = useState<Mode>('mult');
  const [a, setA] = useState(4);
  const [b, setB] = useState(7);
  const [n, setN] = useState(23);
  const [d, setD] = useState(5);

  const q = Math.floor(n / d);
  const r = n % d;
  const cols = mode === 'mult' ? b : d;
  const rows = mode === 'mult' ? a : q + (r ? 1 : 0);
  const cell = Math.min(AREA_W / cols, AREA_H / Math.max(rows, 1), 30);
  const gw = cols * cell;
  const x0 = LEFT + (AREA_W - gw) / 2;
  const y0 = TOP;
  // a altura acompanha o desenho; os controles ficam acima para não pularem
  const h = TOP + Math.max(rows, 1) * cell + 10;

  const cells: { x: number; y: number; rest: boolean }[] = [];
  const total = mode === 'mult' ? a * b : n;
  for (let i = 0; i < total; i++) {
    const row = Math.floor(i / cols);
    cells.push({ x: x0 + (i % cols) * cell, y: y0 + row * cell, rest: mode === 'div' && row >= q });
  }
  const fullRows = mode === 'mult' ? a : q;

  const label = mode === 'mult'
    ? `Retângulo de ${a} por ${b}: ${a * b} quadradinhos`
    : `${n} dividido em grupos de ${d}: ${q} grupos e resto ${r}`;

  return (
    <Interactive title={mode === 'mult' ? 'Multiplicar é calcular área' : 'Dividir é formar grupos'} hint="Mexa nos controles e veja o desenho mudar.">
      <Toggle
        label="Operação"
        value={mode}
        onChange={setMode}
        options={[{ value: 'mult', label: 'Multiplicar (×)' }, { value: 'div', label: 'Dividir (÷)' }]}
      />
      <div className="mt-2.5 grid gap-2.5">
        {mode === 'mult' ? (
          <>
            <Slider label="Fileiras" value={a} min={1} max={12} onChange={setA} />
            <Slider label="Colunas" value={b} min={1} max={12} onChange={setB} />
          </>
        ) : (
          <>
            <Slider label="Total" value={n} min={1} max={40} onChange={setN} />
            <Slider label="Grupos de" value={d} min={3} max={10} onChange={setD} />
          </>
        )}
      </div>
      <svg viewBox={`0 0 ${W} ${h}`} role="img" aria-label={label} className="mt-2.5 block h-auto w-full select-none">
        {cells.map((c, i) => (
          <rect
            key={i}
            x={c.x + 1.5}
            y={c.y + 1.5}
            width={cell - 3}
            height={cell - 3}
            rx={Math.min(5, cell / 6)}
            className={c.rest ? 'f-wrong s-wrong' : 'f-acc-soft s-acc'}
            fillOpacity={c.rest ? 0.3 : 1}
            strokeWidth={1.5}
          />
        ))}
        {/* linha de cima: quantas colunas */}
        <line x1={x0} x2={x0 + gw} y1={TOP - 12} y2={TOP - 12} className="s-ink2" strokeWidth={1.5} />
        <line x1={x0} x2={x0} y1={TOP - 17} y2={TOP - 7} className="s-ink2" strokeWidth={1.5} />
        <line x1={x0 + gw} x2={x0 + gw} y1={TOP - 17} y2={TOP - 7} className="s-ink2" strokeWidth={1.5} />
        <rect x={x0 + gw / 2 - 16} y={TOP - 26} width={32} height={22} rx={6} className="f-surface" />
        <text x={x0 + gw / 2} y={TOP - 9} textAnchor="middle" fontSize={17} fontWeight={600} className="f-blue">
          {cols}
        </text>
        {/* linha da esquerda: quantas fileiras completas */}
        {fullRows > 0 && (
          <>
            <line x1={x0 - 12} x2={x0 - 12} y1={y0} y2={y0 + fullRows * cell} className="s-ink2" strokeWidth={1.5} />
            <line x1={x0 - 17} x2={x0 - 7} y1={y0} y2={y0} className="s-ink2" strokeWidth={1.5} />
            <line x1={x0 - 17} x2={x0 - 7} y1={y0 + fullRows * cell} y2={y0 + fullRows * cell} className="s-ink2" strokeWidth={1.5} />
            <text x={x0 - 20} y={y0 + (fullRows * cell) / 2 + 6} textAnchor="end" fontSize={17} fontWeight={600} className="f-blue">
              {fullRows}
            </text>
          </>
        )}
        {mode === 'div' && r > 0 && r * cell + 60 < gw && (
          <text x={x0 + r * cell + 8} y={y0 + q * cell + cell / 2 + 5} fontSize={15} fontWeight={600} className="f-wrong">
            resto
          </text>
        )}
      </svg>
      <Readout>
        {mode === 'mult' ? (
          <>
            <MathText as="div" text={`\\(${a} \\times ${b} = ${a * b}\\)`} className="text-[1.2rem]" />
            <p className="mt-1 text-[0.9rem] text-ink-2">
              {a} {a === 1 ? 'fileira' : 'fileiras'} de {b} {b === 1 ? 'quadradinho' : 'quadradinhos'}. Girando o retângulo, ele vira{' '}
              <MathText text={`\\(${b} \\times ${a}\\)`} />, com a mesma área: a ordem não muda o produto.
            </p>
          </>
        ) : (
          <>
            <MathText as="div" text={`\\(${n} = ${d} \\times ${q} + ${r}\\)`} className="text-[1.2rem]" />
            <p className="mt-1 text-[0.9rem] text-ink-2">
              {q === 0
                ? `Não dá para formar nenhum grupo de ${d}: o quociente é 0 e tudo fica de resto.`
                : `Formamos ${q} ${q === 1 ? 'grupo' : 'grupos'} de ${d} (quociente ${q}). `}
              {q > 0 && (r === 0 ? 'Não sobra nada: a divisão é exata.' : `${r === 1 ? 'Sobra 1' : `Sobram ${r}`}: é o resto, sempre menor que ${d}.`)}
            </p>
          </>
        )}
      </Readout>
    </Interactive>
  );
}
