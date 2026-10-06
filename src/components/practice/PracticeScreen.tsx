'use client';

import { FocusHeader } from '@/components/focus/FocusHeader';
import { LEVEL_UP_STREAK, emptyStats } from '@/progress/model';
import { useProgress } from '@/progress/store';
import { Practice } from './Practice';
import type { PracticeTopic } from './usePractice';

/**
 * Treino em tela cheia. Com um tópico, a barra mostra o caminho até o
 * próximo nível; no treino misto, mostra os acertos da sessão.
 */
export function PracticeScreen({ topics, closeHref = '/treino', title }: { topics: PracticeTopic[]; closeHref?: string; title: string }) {
  const progress = useProgress();
  const single = topics.length === 1 ? progress.topics[topics[0].topic] ?? emptyStats() : null;
  const ratio = single ? (single.level === 3 ? 1 : single.levelStreak / LEVEL_UP_STREAK) : undefined;

  return (
    <div className="flex min-h-dvh flex-col">
      <FocusHeader closeHref={closeHref} progress={ratio} right={!single && <span className="text-sm font-extrabold text-ink-3">{title}</span>} />
      <div className="flex flex-1 flex-col">
        <Practice topics={topics} />
      </div>
    </div>
  );
}
