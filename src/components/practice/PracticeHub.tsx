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
    <>
      <section className="c-gold overflow-hidden rounded-3xl bg-accent text-on-accent shadow-[0_5px_0_var(--accent-shade)]">
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
            <Link href={`/treino/revisao?aulas=${chosen.map((l) => l.id).join(',')}`} className="flex min-h-12 items-center justify-center rounded-2xl bg-surface px-4 font-extrabold tracking-wide text-ink uppercase no-underline shadow-[0_4px_0_rgb(0_0_0/0.2)] active:translate-y-1 active:shadow-none">
              Começar treino misto
            </Link>
          ) : (
            <p className="font-bold">Escolha pelo menos dois tópicos.</p>
          )}
        </div>
      </section>

      <h2 className="mt-10 mb-4 text-[1.5rem]">Por tópico</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {lessons.map((l) => {
          const s = mounted ? progress.topics[l.topic] : undefined;
          const accuracy = s?.total ? Math.round((100 * s.correct) / s.total) : null;
          return (
            <Link key={l.id} href={`/treino/${l.id}`} className={`c-${l.color} card flex items-center gap-4 p-4 text-ink no-underline shadow-[0_4px_0_var(--line)] active:translate-y-1 active:shadow-none`}>
              <span className="grid size-14 flex-none place-items-center rounded-2xl bg-accent font-serif text-[1.4rem] font-bold text-on-accent shadow-[0_4px_0_var(--accent-shade)]">
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
    </>
  );
}
