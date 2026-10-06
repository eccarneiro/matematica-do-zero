'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { ModuleColor } from '@/content/types';
import type { TopicId } from '@/generators/registry';
import { LEVEL_NAMES } from '@/generators/types';
import { useMounted } from '@/lib/useMounted';
import { useProgress } from '@/progress/store';
import { IconStar } from '@/components/ui/icons';

interface HubLesson {
  id: string;
  title: string;
  symbol: string;
  topic: TopicId;
  color: ModuleColor;
}

/** Central de treino: treino misto em destaque + um cartão por tópico. */
export function PracticeHub({ lessons }: { lessons: HubLesson[] }) {
  const progress = useProgress();
  const mounted = useMounted();
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

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[400px_minmax(0,1fr)]">
      <section className="c-gold overflow-hidden rounded-2xl border-2 border-edge bg-accent text-on-accent shadow-[4px_4px_0_var(--edge)] lg:sticky lg:top-8">
        <div className="relative px-5 pt-5 pb-4">
          <IconStar className="absolute -top-4 -right-4 size-28 opacity-25" />
          <p className="text-[0.72rem] font-black tracking-[0.14em] uppercase opacity-80">Revisão</p>
          <h2 className="mt-1 text-[1.7rem]">Treino misto</h2>
          <p className="mt-1 max-w-[42ch] font-semibold opacity-90">
            Questões sorteadas entre os tópicos escolhidos, cada um no nível que você já alcançou.
          </p>
        </div>
        <div className="bg-[color-mix(in_srgb,var(--accent)_70%,white)] px-5 py-4 dark:bg-[color-mix(in_srgb,var(--accent)_70%,black)]">
          <div className="mb-4 flex flex-wrap gap-2">
            {lessons.map((l) => {
              const on = mounted && selected.has(l.id);
              return (
                <button
                  key={l.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(l.id)}
                  className={`cursor-pointer rounded-full border-2 px-3 py-1 text-[0.85rem] font-extrabold ${on ? 'border-transparent bg-surface text-ink' : 'border-current/40 text-current opacity-80'}`}
                >
                  {l.symbol} {l.title}
                </button>
              );
            })}
          </div>
          {chosen.length >= 2 ? (
            <Link href={`/treino/revisao?aulas=${chosen.map((l) => l.id).join(',')}`} className="btn btn-ghost w-full">
              Começar treino misto
            </Link>
          ) : (
            <p className="font-bold">Escolha pelo menos dois tópicos.</p>
          )}
        </div>
      </section>

      <div>
      <h2 className="mb-4 text-[1.5rem]">Por tópico</h2>
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
        {lessons.map((l) => {
          const s = mounted ? progress.topics[l.topic] : undefined;
          const accuracy = s?.total ? Math.round((100 * s.correct) / s.total) : null;
          return (
            <Link key={l.id} href={`/treino/${l.id}`} className={`c-${l.color} tile flex items-center gap-4 p-4`}>
              <span className="grid size-14 flex-none place-items-center rounded-full border-2 border-edge bg-accent font-serif text-[1.4rem] font-bold text-on-accent">
                {l.symbol}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-black">{l.title}</span>
                <span className="mt-1 flex items-center gap-2 text-[0.8rem] font-bold text-ink-3">
                  {s?.total ? (
                    <>
                      <span className="pill px-2 text-[0.7rem]">{LEVEL_NAMES[s.level]}</span>
                      {accuracy}% de acerto · {s.total} feitas
                    </>
                  ) : (
                    'Ainda não treinado'
                  )}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
      </div>
    </div>
  );
}
