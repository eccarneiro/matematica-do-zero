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
  lessonId, title, steps, topic, nextLesson,
}: {
  lessonId: string;
  title: string;
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

  return (
    <div className="flex min-h-dvh flex-col">
      <FocusHeader
        progress={ratio}
        right={<span className="text-[0.85rem] font-extrabold text-ink-3 tabular-nums">{index + 1}/{steps.length}</span>}
      />

      <div className="mx-auto w-full max-w-[680px] px-4 pt-2">
        <p className="eyebrow mb-0">{step.label}</p>
        {index === 0 && <h1 className="mt-1 text-[clamp(1.7rem,6vw,2.3rem)]">{title}</h1>}
      </div>

      {isPractice ? (
        <>
          <div className="mx-auto mt-3 w-full max-w-[640px] px-4">
            <div className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 ${alreadyDone || goal >= LESSON_GOAL ? 'c-success border-accent bg-accent-soft' : 'border-line bg-surface'}`}>
              {alreadyDone || goal >= LESSON_GOAL ? (
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
          </div>
          <div className="flex flex-1 flex-col">
            {topic && <Practice topics={[topic]} onResult={onResult} />}
          </div>
        </>
      ) : (
        <>
          <div key={step.id} className="mx-auto w-full max-w-[680px] flex-1 animate-[fade-in_.3s_ease] px-4 pt-4 pb-10">
            {step.content}
          </div>
          <div className="sticky bottom-0 z-10 border-t-2 border-line bg-bg">
            <div className="mx-auto flex max-w-[680px] gap-3 px-4 pt-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
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
        <div className="c-gold mb-6 grid size-28 animate-[pop_.5s_ease] place-items-center rounded-full bg-accent shadow-[0_8px_0_var(--accent-shade)]">
          <IconStar className="size-16" />
        </div>
        <h2 className="text-[2.2rem] text-gold">Aula concluída!</h2>
        <p className="mt-2 text-lg font-semibold text-ink-2">Mais uma ideia da história da matemática é sua.</p>
        <div className="mt-8 grid w-full grid-cols-2 gap-3">
          <div className="c-gold overflow-hidden rounded-2xl border-2 border-accent">
            <p className="bg-accent py-1 text-[0.75rem] font-black tracking-widest text-on-accent uppercase">XP nesta aula</p>
            <p className="flex items-center justify-center gap-1.5 py-3 text-2xl font-black text-accent"><IconStar className="size-6" />{xpToday}</p>
          </div>
          <div className="overflow-hidden rounded-2xl border-2 border-flame">
            <p className="bg-flame py-1 text-[0.75rem] font-black tracking-widest text-white uppercase">Sequência</p>
            <p className="flex items-center justify-center gap-1.5 py-3 text-2xl font-black text-flame"><IconFlame className="size-6" />{streak} {streak === 1 ? 'dia' : 'dias'}</p>
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
      </div>
    </div>
  );
}
