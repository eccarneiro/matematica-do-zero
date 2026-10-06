'use client';

import { useState } from 'react';
import { MathText } from '@/components/MathText';
import { Interactive, Readout, Slider } from './Interactive';

const DIVISORS = [-2, -1, -0.5, -0.1, -0.01, -0.001, 0, 0.001, 0.01, 0.1, 0.5, 1, 2];
const N = 12;

/** Número no padrão brasileiro, pronto para o KaTeX (vírgula e ponto sem espaço extra). */
const fmt = (x: number) => x.toLocaleString('pt-BR', { maximumFractionDigits: 3 }).replace(/[.,]/g, (c) => `{${c}}`);

/** 12 dividido por números cada vez mais perto de zero, pelos dois lados. */
export function DivisorPequeno() {
  const [i, setI] = useState(9);
  const d = DIVISORS[i];
  const ds = d < 0 ? `(${fmt(d)})` : fmt(d);
  const q = d === 0 ? null : Math.round((N / d) * 1000) / 1000;

  return (
    <Interactive title="Dividindo por quase nada" hint="Arraste o divisor para perto de zero, pela direita e pela esquerda.">
      <Slider label="Divisor" value={i} min={0} max={DIVISORS.length - 1} onChange={setI} format={(k) => DIVISORS[k].toLocaleString('pt-BR')} />
      <Readout>
        {q === null ? (
          <>
            <MathText as="div" text={`\\(${N} \\div 0 = \\;?\\)`} className="text-[1.25rem]" />
            <p className="mt-1 text-[0.9rem] text-ink-2">
              Nenhum número vezes 0 dá 12. Repare também que, chegando pela direita, o resultado cresce para cima, e pela esquerda, para baixo: não há um valor para escolher.
            </p>
          </>
        ) : (
          <>
            <MathText as="div" text={`\\(${N} \\div ${ds} = ${fmt(q)}\\)`} className="text-[1.25rem]" />
            <MathText as="div" text={`\\(\\text{conferindo: } ${fmt(q)} \\times ${ds} = ${N}\\)`} className="mt-1 text-[0.95rem] text-ink-2" />
          </>
        )}
      </Readout>
    </Interactive>
  );
}
