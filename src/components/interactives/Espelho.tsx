'use client';

import { useState } from 'react';
import { MathText } from '@/components/MathText';
import { Interactive, Readout, Slider } from './Interactive';

const MIN = -10, MAX = 10, W = 420, P = 18, Y = 70;
const x = (v: number) => P + ((v - MIN) / (MAX - MIN)) * (W - 2 * P);
const fmt = (v: number) => (v < 0 ? `-${-v}` : String(v));

/** Oposto e módulo: o número e seu "espelho" do outro lado do zero. */
export function Espelho() {
  const [n, setN] = useState(-6);
  return (
    <Interactive title="O espelho do zero" hint="Mova o número: o oposto aparece do outro lado, à mesma distância.">
      <svg viewBox={`0 0 ${W} 120`} className="block h-auto w-full" role="img" aria-label={`${fmt(n)} e seu oposto ${fmt(-n)}`}>
        <line x1={P - 8} x2={W - P + 8} y1={Y} y2={Y} strokeWidth={2} className="s-ink2" />
        {Array.from({ length: MAX - MIN + 1 }, (_, i) => MIN + i).map((v) => (
          <g key={v}>
            <line x1={x(v)} x2={x(v)} y1={Y - (v % 5 ? 5 : 9)} y2={Y + (v % 5 ? 5 : 9)} strokeWidth={v === 0 ? 2.5 : 1.3} className={v === 0 ? 's-ink' : 's-ink2'} />
            {v % 5 === 0 && <text x={x(v)} y={Y + 28} textAnchor="middle" fontSize={13} className="f-ink2">{fmt(v)}</text>}
          </g>
        ))}
        {n !== 0 && (
          <>
            <path d={`M${x(0)} ${Y - 14} H${x(n)}`} strokeWidth={4} strokeLinecap="round" className="s-blue" opacity={0.6} />
            <path d={`M${x(0)} ${Y - 14} H${x(-n)}`} strokeWidth={4} strokeLinecap="round" className="s-acc" opacity={0.6} />
            <text x={(x(0) + x(n)) / 2} y={Y - 22} textAnchor="middle" fontSize={13} fontWeight={800} className="f-blue">{Math.abs(n)}</text>
            <text x={(x(0) + x(-n)) / 2} y={Y - 22} textAnchor="middle" fontSize={13} fontWeight={800} className="f-acc">{Math.abs(n)}</text>
          </>
        )}
        <circle cx={x(n)} cy={Y} r={8} className="f-blue" />
        <circle cx={x(-n)} cy={Y} r={8} className="f-acc" />
      </svg>
      <div className="mt-2"><Slider label="Número" value={n} min={-10} max={10} onChange={setN} format={fmt} /></div>
      <Readout>
        <MathText as="div" text={`\\(\\text{oposto de } ${fmt(n)} = ${fmt(-n)} \\qquad |${fmt(n)}| = ${Math.abs(n)}\\)`} className="text-[1.05rem]" />
        <p className="mt-1 text-[0.9rem] text-ink-2">Os dois estão a {Math.abs(n)} {Math.abs(n) === 1 ? 'casa' : 'casas'} do zero: é isso que o módulo mede.</p>
      </Readout>
    </Interactive>
  );
}
