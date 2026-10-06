'use client';

import { useState } from 'react';
import { MathText } from '@/components/MathText';
import { Interactive, Readout, Slider, Toggle } from './Interactive';

type Mode = 'quadrado' | 'dobrar';

const dots = (v: number) => v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const fmt = (v: number) => dots(v).replace(/\./g, '{.}');

/** Quadrado n × n (área n²) e o crescimento das dobras (2ⁿ). */
export function QuadradoPotencia() {
  const [mode, setMode] = useState<Mode>('quadrado');
  const [n, setN] = useState(5);
  const [d, setD] = useState(4);

  return (
    <Interactive
      title={mode === 'quadrado' ? 'Quadrado e raiz' : 'Dobrar e dobrar'}
      hint={mode === 'quadrado' ? 'Mude o lado e conte os quadradinhos.' : 'Cada passo dobra o anterior: veja a barra disparar.'}
    >
      <div className="mb-3">
        <Toggle label="Modo" value={mode} onChange={setMode} options={[{ value: 'quadrado', label: 'Quadrado (n²)' }, { value: 'dobrar', label: 'Dobrar (2ⁿ)' }]} />
      </div>
      {mode === 'quadrado' ? <Square n={n} setN={setN} /> : <Doubling n={d} setN={setD} />}
    </Interactive>
  );
}

function Square({ n, setN }: { n: number; setN: (v: number) => void }) {
  const S = 240;
  const P = 30;
  const c = S / n;
  const area = n * n;
  return (
    <>
      <svg viewBox={`0 0 ${S + P + 8} ${S + P + 8}`} role="img" aria-label={`Quadrado de lado ${n} com ${area} quadradinhos`} className="mx-auto block h-auto w-full max-w-[300px]">
        {Array.from({ length: area }, (_, i) => (
          <rect key={i} x={P + (i % n) * c} y={4 + Math.floor(i / n) * c} width={c} height={c} className="f-acc-soft s-acc" strokeWidth={1} strokeOpacity={0.45} />
        ))}
        <rect x={P} y={4} width={S} height={S} fill="none" className="s-acc" strokeWidth={2.5} />
        <text x={P + S / 2} y={S + 26} textAnchor="middle" fontSize={16} fontWeight={600} className="f-ink">{n}</text>
        <text x={P - 12} y={4 + S / 2} textAnchor="middle" dominantBaseline="middle" fontSize={16} fontWeight={600} className="f-ink">{n}</text>
      </svg>
      <div className="mt-2.5">
        <Slider label="Lado (n)" value={n} min={1} max={12} onChange={setN} />
      </div>
      <Readout>
        <MathText as="div" className="text-[1.15rem]" text={`\\(${n}^2 = ${n} \\cdot ${n} = ${area}\\)`} />
        <MathText as="div" className="mt-1 text-[0.95rem] text-ink-2" text={`De volta: \\(\\sqrt{${area}} = ${n}\\), porque a área ${area} vem de um lado ${n}.`} />
      </Readout>
    </>
  );
}

const W = 440;
const H = 220;
const BASE = 190;
const MAXN = 10;

function Doubling({ n, setN }: { n: number; setN: (v: number) => void }) {
  const slot = (W - 20) / (MAXN + 1);
  const bw = slot * 0.7;
  const value = 2 ** n;
  const h = (k: number) => Math.max(2, (2 ** k / 2 ** MAXN) * (BASE - 26));
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Barras de 2 elevado a 0 até 2 elevado a ${MAXN}; destaque em 2 elevado a ${n} = ${value}`} className="block h-auto w-full">
        <line x1={6} x2={W - 6} y1={BASE} y2={BASE} className="s-ink2" strokeWidth={1.5} />
        {Array.from({ length: MAXN + 1 }, (_, k) => {
          const x = 10 + k * slot + (slot - bw) / 2;
          const on = k <= n;
          return (
            <g key={k}>
              <rect
                x={x} y={BASE - h(k)} width={bw} height={h(k)} rx={3}
                className={k === n ? 'f-acc' : on ? 'f-blue' : 'f-surface2 s-line'}
                fillOpacity={on && k !== n ? 0.55 : 1}
                style={{ transition: 'fill .2s' }}
              />
              <text x={x + bw / 2} y={BASE + 18} textAnchor="middle" fontSize={13} className={k === n ? 'f-acc' : 'f-ink2'} fontWeight={k === n ? 700 : 400}>
                {k}
              </text>
            </g>
          );
        })}
        <text
          x={Math.min(W - 30, Math.max(30, 10 + n * slot + slot / 2))} y={BASE - h(n) - 8}
          textAnchor="middle" fontSize={15} fontWeight={700} className="f-acc"
        >
          {dots(value)}
        </text>
      </svg>
      <div className="mt-2.5">
        <Slider label="Dobras (n)" value={n} min={0} max={MAXN} onChange={setN} />
      </div>
      <Readout>
        <MathText as="div" className="text-[1.15rem]" text={`\\(2^{${n}} = ${fmt(value)}\\)`} />
        <p className="mt-1 text-[0.9rem] text-ink-2">
          Dobrando uma folha de papel {n} {n === 1 ? 'vez' : 'vezes'}, ela fica com {dots(value)} {value === 1 ? 'camada' : 'camadas'}.
          {n === 0 && ' Sem dobrar nada, a folha é uma camada só: por isso 2⁰ = 1.'}
        </p>
      </Readout>
    </>
  );
}
