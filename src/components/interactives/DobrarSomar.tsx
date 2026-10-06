'use client';

import { useState } from 'react';
import { MathText } from '@/components/MathText';
import { Interactive, Readout, Slider } from './Interactive';

/**
 * Multiplicação egípcia: uma coluna dobra o 1, a outra dobra o número.
 * Marcam-se as linhas cujas potências de 2 somam o multiplicador.
 */
export function DobrarSomar() {
  const [a, setA] = useState(13);
  const [b, setB] = useState(21);

  const rows: { p: number; v: number; on: boolean }[] = [];
  for (let p = 1; p <= a; p *= 2) rows.push({ p, v: p * b, on: (a & p) !== 0 });
  const chosen = rows.filter((r) => r.on);

  return (
    <Interactive title="Dobrar e somar" hint="As linhas marcadas são as que somam o primeiro número. Nunca é preciso repetir uma linha.">
      <div className="grid gap-2.5">
        <Slider label="Multiplicador" value={a} min={1} max={63} onChange={setA} />
        <Slider label="Número" value={b} min={1} max={40} onChange={setB} />
      </div>
      <table className="mx-auto mt-3 w-full max-w-[300px] border-separate border-spacing-y-1 text-center tabular-nums">
        <thead>
          <tr className="text-[0.8rem] font-extrabold text-ink-3">
            <th className="w-10" aria-label="usar a linha?" />
            <th>vezes</th>
            <th>{`${b} dobrado`}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.p} className={r.on ? 'bg-accent-soft font-extrabold text-accent' : 'text-ink-3'}>
              <td className="rounded-l-xl py-1">{r.on ? '✓' : ''}</td>
              <td className="py-1">{r.p}</td>
              <td className="rounded-r-xl py-1">{r.v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Readout>
        <MathText as="div" text={`\\(${a} = ${chosen.map((r) => r.p).join(' + ')}\\)`} className="text-[1.05rem]" />
        <MathText
          as="div"
          text={`\\(${a} \\times ${b} = ${chosen.length > 1 ? `${chosen.map((r) => r.v).join(' + ')} = ` : ''}${a * b}\\)`}
          className="mt-1 text-[1.05rem]"
        />
      </Readout>
    </Interactive>
  );
}
