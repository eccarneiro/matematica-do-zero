'use client';

import { useState } from 'react';
import { MathText } from '@/components/MathText';
import { Interactive, Readout, Toggle } from './Interactive';

const MAX = 12;
const frac = (n: number | string, d: number | string) => `\\frac{${n}}{${d}}`;
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

type Shape = 'pizza' | 'barra';

/** Ponto na borda do círculo, começando no topo e girando no sentido horário. */
function edge(i: number, n: number, cx: number, cy: number, r: number) {
  const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
  return `${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`;
}

/** Props de um pedaço clicável (mouse, toque e teclado). */
function slice(i: number, on: boolean, toggle: (i: number) => void) {
  return {
    role: 'button',
    tabIndex: 0,
    'aria-pressed': on,
    'aria-label': `Pedaço ${i + 1}${on ? ', pintado' : ''}`,
    className: `${on ? 'f-acc' : 'f-surface2'} s-ink cursor-pointer outline-none transition-[fill] duration-150`,
    strokeWidth: 2.5,
    strokeLinejoin: 'round' as const,
    onClick: () => toggle(i),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle(i);
      }
    },
  };
}

function Pizza({ n, painted, toggle }: { n: number; painted: boolean[]; toggle: (i: number) => void }) {
  const [c, r] = [120, 112];
  return (
    <svg viewBox="0 0 240 240" className="mx-auto block h-auto w-full max-w-[280px] touch-manipulation select-none">
      {n === 1 ? (
        <circle cx={c} cy={c} r={r} {...slice(0, painted[0], toggle)} />
      ) : (
        painted.slice(0, n).map((on, i) => (
          <path key={i} d={`M${c} ${c} L${edge(i, n, c, c, r)} A${r} ${r} 0 0 1 ${edge(i + 1, n, c, c, r)} Z`} {...slice(i, on, toggle)} />
        ))
      )}
    </svg>
  );
}

/** Barra dividida em n partes; clicável quando recebe toggle. */
function Bar({ n, painted, toggle, height = 72 }: { n: number; painted: boolean[]; toggle?: (i: number) => void; height?: number }) {
  const w = 316 / n;
  return (
    <svg viewBox={`0 0 320 ${height + 4}`} className="block h-auto w-full touch-manipulation select-none">
      {painted.slice(0, n).map((on, i) =>
        toggle ? (
          <rect key={i} x={2 + i * w} y={2} width={w} height={height} {...slice(i, on, toggle)} />
        ) : (
          <rect key={i} x={2 + i * w} y={2} width={w} height={height} className={`${on ? 'f-acc' : 'f-surface2'} s-ink`} strokeWidth={n > 24 ? 1.2 : 2} />
        ),
      )}
    </svg>
  );
}

/** Controle deslizante compacto (cabe numa linha em telas de 340px). */
function Range({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <label className="flex items-center gap-2.5">
      <span className="shrink-0 text-[0.9rem] text-ink-2">{label}</span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-7 min-w-0 flex-1 accent-accent" />
      <output className="min-w-[2ch] text-right font-semibold text-ink tabular-nums">{value}</output>
    </label>
  );
}

/** Pizza ou barra: escolha em quantas partes cortar e toque nos pedaços para pintar. */
export function PizzaFracoes() {
  const [shape, setShape] = useState<Shape>('pizza');
  const [n, setN] = useState(4);
  const [painted, setPainted] = useState<boolean[]>(() => Array.from({ length: MAX }, (_, i) => i < 3));
  const [showEq, setShowEq] = useState(false);
  const [cut, setCut] = useState(2);

  const k = painted.slice(0, n).filter(Boolean).length;
  const toggle = (i: number) => setPainted((p) => p.map((v, j) => (j === i ? !v : v)));
  const step = (delta: 1 | -1) =>
    setPainted((p) => {
      const cur = p.slice(0, n);
      const i = delta > 0 ? cur.indexOf(false) : cur.lastIndexOf(true);
      return i < 0 ? p : p.map((v, j) => (j === i ? delta > 0 : v));
    });

  // Leitura da fração: forma simplificada, inteiro e zero.
  const g = gcd(k, n);
  let tex = frac(k, n);
  if (k === 0) tex += ' = 0';
  else if (k === n) tex += ' = 1';
  else if (g > 1) tex += ` = ${frac(k / g, n / g)}`;
  const words =
    k === n ? 'Todos os pedaços pintados: a fração vale um inteiro.' : `${k} de ${n} ${n === 1 ? 'pedaço' : 'pedaços iguais'} ${k === 1 ? 'pintado' : 'pintados'}.`;

  // Equivalente: cada pedaço cortado em "cut" pedaços menores.
  const fine = Array.from({ length: n * cut }, (_, j) => painted[Math.floor(j / cut)]);

  return (
    <Interactive title="Pizza de frações" hint="Toque nos pedaços para pintar ou apagar.">
      <div className="mb-3">
        <Toggle label="Forma" value={shape} onChange={setShape} options={[{ value: 'pizza', label: '🍕 Pizza' }, { value: 'barra', label: '🍫 Barra' }]} />
      </div>

      {shape === 'pizza' ? <Pizza n={n} painted={painted} toggle={toggle} /> : <Bar n={n} painted={painted} toggle={toggle} />}

      <div className="mt-3 grid gap-2.5">
        <Range label="Partes iguais" value={n} min={1} max={MAX} onChange={setN} />
        <div className="flex items-center gap-2">
          <span className="text-[0.9rem] text-ink-2">Pintar</span>
          <button type="button" onClick={() => step(-1)} disabled={k === 0} aria-label="Apagar um pedaço" className="min-h-11 min-w-11 cursor-pointer rounded-full border-[1.5px] border-line bg-surface text-xl leading-none disabled:opacity-40">
            −
          </button>
          <button type="button" onClick={() => step(1)} disabled={k === n} aria-label="Pintar mais um pedaço" className="min-h-11 min-w-11 cursor-pointer rounded-full border-[1.5px] border-line bg-surface text-xl leading-none disabled:opacity-40">
            +
          </button>
        </div>
      </div>

      <Readout>
        <MathText as="div" text={`\\(\\displaystyle ${tex}\\)`} className="text-[1.25rem]" />
        <p className="mt-1 text-[0.9rem] text-ink-2">{words}</p>
      </Readout>

      <div className="mt-3 border-t border-line pt-3">
        <button
          type="button"
          aria-pressed={showEq}
          onClick={() => setShowEq((v) => !v)}
          className={`min-h-10 w-full cursor-pointer rounded-full border-[1.5px] px-3.5 py-1.5 text-[0.92rem] ${showEq ? 'border-accent bg-accent-soft font-medium text-accent' : 'border-line bg-surface'}`}
        >
          {showEq ? 'Esconder frações equivalentes' : 'Ver frações equivalentes'}
        </button>

        {showEq && (
          <div className="mt-3 grid gap-2.5">
            <Range label="Cortar cada pedaço em" value={cut} min={2} max={4} onChange={setCut} />
            <div className="grid grid-cols-[3.2rem_1fr] items-center gap-x-2 gap-y-3">
              <MathText text={`\\(\\displaystyle ${frac(k, n)}\\)`} className="text-center" />
              <Bar n={n} painted={painted} height={44} />
              <MathText text={`\\(\\displaystyle ${frac(k * cut, n * cut)}\\)`} className="text-center" />
              <Bar n={n * cut} painted={fine} height={44} />
            </div>
            <Readout>
              <MathText as="div" text={`\\(\\displaystyle ${frac(k, n)} = ${frac(`${k} \\cdot ${cut}`, `${n} \\cdot ${cut}`)} = ${frac(k * cut, n * cut)}\\)`} className="text-[1.1rem]" />
              <p className="mt-1 text-[0.9rem] text-ink-2">A parte pintada é a mesma: só os pedaços ficaram menores.</p>
            </Readout>
          </div>
        )}
      </div>
    </Interactive>
  );
}
