'use client';

import { practiceLessons } from '@/content/curriculum';
import { LEVEL_NAMES } from '@/generators/types';
import { TOPIC_TITLES } from '@/generators/registry';
import { useMounted } from '@/lib/useMounted';
import { progressStore, useProgress } from '@/progress/store';
import { useGameStats } from '@/progress/useGameStats';
import { AccountCard } from '@/components/layout/AuthButton';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { FeedbackButton } from '@/components/feedback/FeedbackButton';
import { IconFlame, IconStar } from '@/components/ui/icons';

export function Profile() {
  const mounted = useMounted();
  const progress = useProgress();
  const stats = useGameStats();
  const lessons = practiceLessons();
  // Nível e placar são por tópico: um item por tópico.
  const topics = lessons.filter(({ lesson }, i, arr) => arr.findIndex((x) => x.lesson.topic === lesson.topic) === i);
  const doneCount = lessons.filter(({ lesson }) => progress.lessons[lesson.id]?.done).length;
  const totals = Object.values(progress.topics).reduce((a, t) => ({ c: a.c + t.correct, t: a.t + t.total }), { c: 0, t: 0 });

  function reset() {
    if (confirm('Apagar todo o seu progresso neste aparelho (aulas, placar e XP)?')) progressStore.reset();
  }

  const tiles: [React.ReactNode, string, string][] = [
    [<IconFlame key="f" className="size-8" off={!stats.studiedToday} />, `${stats.streak}`, stats.streak === 1 ? 'dia seguido' : 'dias seguidos'],
    [<IconStar key="s" className="size-8" />, `${stats.xp}`, 'XP no total'],
    [<span key="l" className="text-[1.6rem]">📚</span>, `${doneCount}/${lessons.length}`, 'aulas concluídas'],
    [<span key="a" className="text-[1.6rem]">🎯</span>, totals.t ? `${Math.round((100 * totals.c) / totals.t)}%` : '–', 'de acerto de primeira'],
  ];

  return (
    <div className="grid items-start gap-8 lg:grid-cols-2">
      <div className="lg:col-span-2"><AccountCard /></div>

      <section>
        <h2 className="mb-3 text-[1.5rem]">Estatísticas</h2>
        <div className="grid grid-cols-2 gap-3">
          {tiles.map(([icon, value, label]) => (
            <div key={label} className="card flex items-center gap-3 p-4">
              {icon}
              <div>
                <p className="text-[1.4rem] leading-none font-extrabold">{mounted ? value : '–'}</p>
                <p className="mt-1 text-[0.8rem] font-bold text-ink-3">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[1.5rem]">Seus tópicos</h2>
        <div className="card divide-y-2 divide-line">
          {topics.map(({ module: mod, lesson }) => {
            const t = mounted ? progress.topics[lesson.topic] : undefined;
            const ratio = t?.total ? t.correct / t.total : 0;
            return (
              <div key={lesson.id} className={`c-${mod.color} flex items-center gap-3 px-4 py-3`}>
                <span className="grid size-10 flex-none place-items-center rounded-full bg-accent font-display font-bold text-on-accent">{lesson.symbol}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-extrabold">{TOPIC_TITLES[lesson.topic]}</p>
                    {t?.total ? <span className="pill flex-none px-2 text-[0.7rem]">{LEVEL_NAMES[t.level]}</span> : null}
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${ratio * 100}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[1.5rem]">Ajustes</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <ThemeToggle />
          <FeedbackButton className="btn btn-ghost justify-start" label={<>💬 Enviar feedback</>} />
          <button type="button" onClick={reset} className="btn btn-ghost justify-start normal-case text-danger">
            Apagar progresso deste aparelho
          </button>
        </div>
      </section>
      <p className="text-[0.85rem] text-ink-3 lg:col-span-2">
        <a href="/privacidade">Política de privacidade</a> · <a href="/termos">Termos de uso</a>
      </p>
    </div>
  );
}
