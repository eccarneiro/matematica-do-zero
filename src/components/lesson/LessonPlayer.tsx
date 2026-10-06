'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { FocusHeader } from '@/components/focus/FocusHeader';
import { Practice } from '@/components/practice/Practice';
import type { PracticeTopic } from '@/components/practice/usePractice';
import { IconArrow, IconCheck, IconFlame, IconStar } from '@/components/ui/icons';
import { LESSON_GOAL, dayKey } from '@/progress/model';
import { useMounted } from '@/lib/useMounted';
import { progressStore, useProgress } from '@/progress/store';
import { useGameStats } from '@/progress/useGameStats';
import { Confetti } from './Confetti';
import { Stamp } from '@/components/dashboard/Stamp';
import { FeedbackButton } from '@/components/feedback/FeedbackButton';

const todayXp = () => progressStore.get().days?.[dayKey()] ?? 0;

export interface PlayerStep {
  id: string;
  label: string;
  content?: React.ReactNode;
}

/**
 * Aula em passos, em tela cheia: uma etapa por vez, botão Continuar fixo
 * embaixo. A última etapa é o treino; acertar LESSON_GOAL questões de
 * primeira conclui a aula.
 */
export function LessonPlayer({
  lessonId, title, steps, topic, nextLesson, stop,
}: {
  lessonId: string;
  title: string;
  /** Selo da parada (símbolo, ano e lugar) mostrado no painel lateral. */
  stop: { symbol: string; year: string; place: string; title: string };
  steps: PlayerStep[];
  topic?: PracticeTopic;
  nextLesson?: { id: string; title: string };
}) {
  const mounted = useMounted();
  const [chosen, setIndex] = useState<number | null>(null);
  // Etapa na URL (#historia, #treino...) para poder recarregar ou compartilhar.
  const fromHash = mounted ? Math.max(0, steps.findIndex((s) => `#${s.id}` === window.location.hash)) : 0;
  const index = chosen ?? fromHash;
  const [goal, setGoal] = useState(0);
  const goalRef = useRef(0);
  const [celebrate, setCelebrate] = useState<null | { xp: number }>(null);
  const progress = useProgress();
  const alreadyDone = !!progress.lessons[lessonId]?.done;
  const startXp = useRef<number | null>(null);

  // Só reescreve a URL depois que o aluno navega (antes disso, ela é a fonte da etapa).
  useEffect(() => {
    if (chosen === null) return;
    history.replaceState(null, '', `#${steps[chosen].id}`);
    window.scrollTo({ top: 0 });
  }, [chosen, steps]);
  useEffect(() => {
    startXp.current ??= todayXp();
  }, []);

  const step = steps[index];
  const isPractice = step.id === 'treino';
  const isLast = index === steps.length - 1;
  const ratio = (index + (isPractice ? Math.min(goal, LESSON_GOAL) / LESSON_GOAL : 0)) / steps.length;

  // Gravado fora do setState: no modo estrito o React chama updaters duas vezes.
  function onResult(outcome: 'first' | 'retry' | 'miss') {
    if (outcome !== 'first') return;
    goalRef.current += 1;
    setGoal(goalRef.current);
    if (goalRef.current === LESSON_GOAL && !alreadyDone) {
      progressStore.setLessonDone(lessonId, true);
      const xp = todayXp() - (startXp.current ?? 0);
      // espera o painel de acerto aparecer antes da comemoração
      setTimeout(() => setCelebrate({ xp }), 900);
    }
  }

  const goalDone = alreadyDone || goal >= LESSON_GOAL;
  const goalBox = (
    <div className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 ${goalDone ? 'c-success border-accent bg-accent-soft' : 'border-edge-soft bg-surface'}`}>
      {goalDone ? (
        <p className="flex items-center gap-2 font-extrabold text-accent">
          <IconCheck className="size-5" /> Aula concluída. Continue treinando quanto quiser!
        </p>
      ) : (
        <>
          <p className="flex-none text-[0.9rem] font-extrabold">Acerte {LESSON_GOAL} de primeira</p>
          <div className="flex flex-1 gap-1.5" aria-label={`${goal} de ${LESSON_GOAL}`}>
            {Array.from({ length: LESSON_GOAL }, (_, i) => (
              <span key={i} className={`h-3 flex-1 rounded-full transition-colors ${i < goal ? 'bg-success' : 'bg-surface-2'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <FocusHeader
        wide
        progress={ratio}
        right={<span className="text-[0.85rem] font-extrabold text-ink-3 tabular-nums">{index + 1}/{steps.length}</span>}
      />

      <div className="mx-auto flex w-full max-w-[1320px] flex-1 gap-10 lg:px-8">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mx-auto w-full max-w-[760px] px-4 pt-2">
            <p className="eyebrow mb-0">{step.label}</p>
            {index === 0 && <h1 className="mt-1 text-[clamp(1.7rem,6vw,2.5rem)] lg:hidden">{title}</h1>}
          </div>

          {isPractice ? (
            <>
              <div className="mx-auto mt-3 w-full max-w-[640px] px-4 lg:hidden">{goalBox}</div>
              <div className="flex flex-1 flex-col">
                {topic && <Practice topics={[topic]} onResult={onResult} />}
              </div>
            </>
          ) : (
            <>
              <div key={step.id} className="mx-auto w-full max-w-[760px] flex-1 animate-[fade-in_.3s_ease] px-4 pt-4 pb-10">
                {step.content}
              </div>
              <div className="sticky bottom-0 z-10 border-t-[1.5px] border-edge-soft bg-bg">
                <div className="mx-auto flex max-w-[760px] gap-3 px-4 pt-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
                  {index > 0 && (
                    <button type="button" onClick={() => setIndex(index - 1)} className="btn btn-ghost flex-none px-4" aria-label="Voltar">
                      <IconArrow className="size-5 rotate-180" />
                    </button>
                  )}
                  <button type="button" onClick={() => setIndex(Math.min(index + 1, steps.length - 1))} className="btn btn-primary flex-1">
                    {steps[index + 1]?.id === 'treino' ? 'Ir para o treino' : isLast ? 'Concluir' : 'Continuar'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Painel lateral (computador): a parada, as etapas e a meta */}
        <aside className="sticky top-20 hidden h-fit w-[320px] flex-none gap-5 pb-8 lg:grid">
          <div className="card overflow-hidden">
            <div className="paper flex items-center gap-4 border-b-[1.5px] border-paper-line p-5">
              <Stamp lesson={stop} earned={alreadyDone} size={76} />
              <div className="min-w-0">
                <p className="text-[0.7rem] font-extrabold tracking-[0.16em] text-paper-ink-2 uppercase">{stop.place} · {stop.year}</p>
                <p className="font-display text-[1.4rem] leading-tight font-semibold text-paper-ink">{title}</p>
              </div>
            </div>
            <ol className="p-3">
              {steps.map((st, i) => {
                const on = i === index;
                const seen = i < index;
                return (
                  <li key={st.id}>
                    <button
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-current={on ? 'step' : undefined}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left text-[0.95rem] font-bold ${on ? 'bg-accent-soft text-ink' : 'text-ink-2 hover:bg-surface-2'}`}
                    >
                      <span className={`grid size-7 flex-none place-items-center rounded-full border-2 text-[0.75rem] font-extrabold ${on ? 'border-edge bg-accent text-on-accent' : seen ? 'border-accent text-accent' : 'border-edge-soft text-ink-3'}`}>
                        {seen ? <IconCheck className="size-3.5" /> : i + 1}
                      </span>
                      {st.label.replace(/^\d+ · /, '')}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
          {goalBox}
        </aside>
      </div>

      {celebrate && (
        <Celebration
          xpToday={celebrate.xp}
          onClose={() => setCelebrate(null)}
          nextLesson={nextLesson}
        />
      )}
    </div>
  );
}

function Celebration({ xpToday, onClose, nextLesson }: { xpToday: number; onClose: () => void; nextLesson?: { id: string; title: string } }) {
  const { streak } = useGameStats();
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg" role="dialog" aria-label="Aula concluída">
      <Confetti />
      <div className="mx-auto flex w-full max-w-[520px] flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="c-gold mb-6 grid size-28 animate-[pop_.5s_ease] place-items-center rounded-full bg-accent border border-edge shadow-card">
          <IconStar className="size-16" />
        </div>
        <h2 className="text-[2.2rem] text-gold">Aula concluída!</h2>
        <p className="mt-2 text-lg font-semibold text-ink-2">Mais uma ideia da história da matemática é sua.</p>
        <div className="mt-8 grid w-full grid-cols-2 gap-3">
          <div className="c-gold overflow-hidden rounded-2xl border-2 border-accent">
            <p className="bg-accent py-1 text-[0.75rem] font-extrabold tracking-widest text-on-accent uppercase">XP nesta aula</p>
            <p className="flex items-center justify-center gap-1.5 py-3 text-2xl font-extrabold text-accent"><IconStar className="size-6" />{xpToday}</p>
          </div>
          <div className="overflow-hidden rounded-2xl border-2 border-flame">
            <p className="bg-flame py-1 text-[0.75rem] font-extrabold tracking-widest text-white uppercase">Sequência</p>
            <p className="flex items-center justify-center gap-1.5 py-3 text-2xl font-extrabold text-flame"><IconFlame className="size-6" />{streak} {streak === 1 ? 'dia' : 'dias'}</p>
          </div>
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-[520px] gap-3 px-6 pb-[calc(24px+env(safe-area-inset-bottom))]">
        {nextLesson ? (
          <Link href={`/aula/${nextLesson.id}`} className="btn btn-primary">Próxima: {nextLesson.title}</Link>
        ) : (
          <Link href="/" className="btn btn-primary">Voltar à trilha</Link>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/" className="btn btn-ghost">Trilha</Link>
          <button type="button" onClick={onClose} className="btn btn-ghost">Treinar mais</button>
        </div>
        <FeedbackButton className="btn-text mx-auto text-[0.95rem] font-bold" label="Como foi esta aula? Conte para a gente" prompt="Como foi esta aula?" />
      </div>
    </div>
  );
}
