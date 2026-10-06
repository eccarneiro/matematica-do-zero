'use client';

import { useState } from 'react';
import { MathText } from '@/components/MathText';
import type { LessonMeta } from '@/content/types';

/** Exemplo resolvido que revela um passo de cada vez. */
export function WorkedExample({ n, example }: { n: number; example: LessonMeta['examples'][number] }) {
  const [shown, setShown] = useState(0);
  const total = example.steps.length;
  const done = shown === total;
  return (
    <div className="card overflow-hidden">
      <div className="border-b-2 border-line bg-surface-2/60 px-5 py-4">
        <p className="text-[0.72rem] font-extrabold tracking-[0.14em] text-accent uppercase">Exemplo {n}</p>
        <MathText as="div" text={example.problem} className="mt-1 text-[1.1rem] font-bold" />
      </div>
      <div className="px-5 py-4">
        {shown > 0 && (
          <ol className="mb-4 grid gap-3">
            {example.steps.slice(0, shown).map((step, i) => (
              <li key={i} className="flex animate-[fade-in_.3s_ease] gap-3">
                <span className={`grid size-7 flex-none place-items-center rounded-full text-[0.8rem] font-extrabold ${i === total - 1 && done ? 'c-success bg-accent text-on-accent' : 'bg-accent-soft text-accent'}`}>
                  {i + 1}
                </span>
                <MathText text={step} className="pt-0.5" />
              </li>
            ))}
          </ol>
        )}
        {!done ? (
          <div className="flex gap-3">
            <button type="button" className="btn btn-primary flex-1" onClick={() => setShown((s) => s + 1)}>
              {shown === 0 ? 'Ver 1º passo' : `Passo ${shown + 1} de ${total}`}
            </button>
            {shown === 0 && (
              <button type="button" className="btn btn-ghost flex-none" onClick={() => setShown(total)}>
                Tudo
              </button>
            )}
          </div>
        ) : (
          <p className="text-[0.85rem] font-extrabold tracking-wide text-ink-3 uppercase">✓ Resolvido</p>
        )}
      </div>
    </div>
  );
}
