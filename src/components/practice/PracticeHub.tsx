'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { ModuleColor } from '@/content/types';
import type { TopicId } from '@/generators/registry';
import { LEVEL_NAMES } from '@/generators/types';
import { useProgress } from '@/progress/store';
import { Practice } from './Practice';

interface HubLesson {
  id: string;
  title: string;
  topic: TopicId;
  color: ModuleColor;
}

/** Lista de tópicos + treino misto com os tópicos escolhidos. */
export function PracticeHub({ lessons }: { lessons: HubLesson[] }) {
  const progress = useProgress();
  // Até o aluno mexer na seleção, usa os tópicos já estudados ou treinados.
  const [picked, setPicked] = useState<Set<string> | null>(null);
  const studied = lessons.filter((l) => progress.lessons[l.id]?.done || (progress.topics[l.topic]?.total ?? 0) > 0);
  const selected = picked ?? new Set((studied.length >= 2 ? studied : lessons).map((l) => l.id));
  const chosen = lessons.filter((l) => selected.has(l.id));

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPicked(next);
  }

  if (!lessons.length) {
    return <p className="mt-6 text-ink-2">O treino aparece aqui assim que a primeira aula for publicada.</p>;
  }

  return (
    <>
      <h2 className="mt-7 mb-3 font-sans text-base font-semibold">Por tópico</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-2.5">
        {lessons.map((l) => {
          const s = progress.topics[l.topic];
          return (
            <Link
              key={l.id}
              href={`/treino/${l.id}`}
              className={`c-${l.color} flex flex-col gap-1 rounded-xl border border-l-4 border-line border-l-accent bg-surface p-3.5 text-ink no-underline`}
            >
              <span className="font-medium">{l.title}</span>
              <span className="text-[0.8rem] text-ink-3">
                {s?.total ? `${s.correct}/${s.total} acertos · ${LEVEL_NAMES[s.level]}` : 'ainda não treinado'}
              </span>
            </Link>
          );
        })}
      </div>

      <h2 className="mt-8 mb-2 font-sans text-base font-semibold">Treino misto</h2>
      <p className="mb-3 text-sm text-ink-2">
        {studied.length >= 2
          ? 'Marcamos os tópicos que você já estudou ou treinou. Toque para mudar.'
          : 'Quando você concluir aulas, elas serão marcadas aqui automaticamente.'}
      </p>
      <div className="mb-4 flex flex-wrap gap-2">
        {lessons.map((l) => (
          <label key={l.id} className="relative cursor-pointer">
            <input type="checkbox" className="peer absolute opacity-0" checked={selected.has(l.id)} onChange={() => toggle(l.id)} />
            <span className="inline-block rounded-full border-[1.5px] border-line bg-surface px-3.5 py-1.5 text-[0.88rem] peer-checked:border-coral peer-checked:bg-coral-soft peer-checked:font-medium peer-checked:text-coral peer-focus-visible:outline-3 peer-focus-visible:outline-coral">
              {l.title}
            </span>
          </label>
        ))}
      </div>
      <div className="c-coral">
        {chosen.length >= 2 ? (
          <Practice topics={chosen.map((l) => ({ topic: l.topic, title: l.title }))} />
        ) : (
          <p className="text-ink-2">Escolha pelo menos dois tópicos para misturar.</p>
        )}
      </div>
    </>
  );
}
