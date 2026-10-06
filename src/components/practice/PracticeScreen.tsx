'use client';

import { useState } from 'react';
import { FocusHeader } from '@/components/focus/FocusHeader';
import { GoalRing } from '@/components/layout/GameStats';
import { CountUp } from '@/components/dashboard/CountUp';
import { IconFlame } from '@/components/ui/icons';
import { LEVEL_NAMES } from '@/generators/types';
import { LEVEL_UP_STREAK, emptyStats } from '@/progress/model';
import { useProgress } from '@/progress/store';
import { useGameStats } from '@/progress/useGameStats';
import { Practice } from './Practice';
import type { Outcome, PracticeTopic } from './usePractice';

/**
 * Treino em tela cheia. No computador, um painel ao lado mostra a sessão,
 * o nível de cada tópico e a meta do dia.
 */
export function PracticeScreen({ topics, closeHref = '/treino', title }: { topics: PracticeTopic[]; closeHref?: string; title: string }) {
  const progress = useProgress();
  const stats = useGameStats();
  const [session, setSession] = useState({ first: 0, done: 0, best: 0, run: 0 });
  const single = topics.length === 1 ? progress.topics[topics[0].topic] ?? emptyStats() : null;
  const ratio = single ? (single.level === 3 ? 1 : single.levelStreak / LEVEL_UP_STREAK) : undefined;

  function onResult(outcome: Outcome) {
    setSession((s) => {
      const run = outcome === 'first' ? s.run + 1 : 0;
      return { first: s.first + (outcome === 'first' ? 1 : 0), done: s.done + 1, run, best: Math.max(s.best, run) };
    });
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <FocusHeader wide closeHref={closeHref} progress={ratio} right={<span className="text-sm font-extrabold text-ink-3">{title}</span>} />
      <div className="mx-auto flex w-full max-w-[1320px] flex-1 gap-10 lg:px-8">
        <div className="flex min-w-0 flex-1 flex-col">
          <Practice topics={topics} onResult={onResult} />
        </div>
        <aside className="sticky top-20 hidden h-fit w-[320px] flex-none gap-5 pb-8 lg:grid">
          <div className="card p-5">
            <h2 className="mb-4 text-[1.25rem]">Nesta sessão</h2>
            <dl className="grid grid-cols-3 gap-2 text-center">
              {[
                [session.first, 'de primeira'],
                [session.done, 'feitas'],
                [session.best, 'maior combo'],
              ].map(([v, label]) => (
                <div key={label} className="rounded-xl bg-surface-2 px-2 py-3">
                  <dd className="text-[1.5rem] leading-none font-extrabold"><CountUp value={v as number} duration={400} /></dd>
                  <dt className="mt-1 text-[0.72rem] font-bold text-ink-3">{label}</dt>
                </div>
              ))}
            </dl>
            {session.run >= 3 && (
              <p className="mt-4 flex animate-[pop_.3s_ease] items-center gap-2 font-extrabold text-flame"><IconFlame className="size-6" /> {session.run} seguidas!</p>
            )}
          </div>

          <div className="card p-5">
            <h2 className="mb-3 text-[1.25rem]">{topics.length > 1 ? 'Tópicos' : 'Seu nível'}</h2>
            <ul className="grid gap-3">
              {topics.map((t) => {
                const s = progress.topics[t.topic] ?? emptyStats();
                return (
                  <li key={t.topic}>
                    <div className="mb-1 flex justify-between gap-2 text-[0.88rem] font-extrabold">
                      <span className="truncate">{t.title}</span>
                      <span className="flex-none text-ink-3">{LEVEL_NAMES[s.level]}</span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: LEVEL_UP_STREAK }, (_, i) => (
                        <span key={i} className={`h-2 flex-1 rounded-full ${s.level === 3 || i < s.levelStreak ? 'bg-accent' : 'bg-surface-2'}`} />
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="card flex items-center gap-4 p-5">
            <GoalRing ratio={stats.goalRatio} done={stats.goalDone} size={52} />
            <div>
              <p className="font-extrabold">Meta do dia</p>
              <p className="text-[0.9rem] text-ink-2">{Math.min(stats.today, stats.goal)} de {stats.goal} XP</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
