'use client';

import { useState } from 'react';
import { MathText } from '@/components/MathText';
import type { LessonMeta } from '@/content/types';

/** Exemplo resolvido que revela um passo de cada vez. */
export function WorkedExample({ n, example }: { n: number; example: LessonMeta['examples'][number] }) {
  const [shown, setShown] = useState(0);
  const total = example.steps.length;
  return (
    <div className="card p-[18px]">
      <p className="mb-1.5 text-[0.78rem] font-semibold tracking-[0.08em] text-ink-3 uppercase">Exemplo {n}</p>
      <MathText as="div" text={example.problem} className="mb-2 text-[1.05rem] font-normal" />
      {shown > 0 && (
        <ol className="mb-3 list-decimal pl-5 marker:font-semibold marker:text-accent">
          {example.steps.slice(0, shown).map((step, i) => (
            <MathText key={i} as="li" text={step} className="mb-2 animate-[fade-in_.3s_ease] pl-1" />
          ))}
        </ol>
      )}
      {shown < total && (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-soft" onClick={() => setShown((s) => s + 1)}>
            {shown === 0 ? 'Mostrar 1º passo' : 'Próximo passo'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setShown(total)}>
            Mostrar tudo
          </button>
        </div>
      )}
    </div>
  );
}
