'use client';

import { useSearchParams } from 'next/navigation';
import { practiceLessons } from '@/content/curriculum';
import { PracticeScreen } from './PracticeScreen';

/** Treino misto com as aulas escolhidas na URL (estrelas de revisão da trilha). */
export function ReviewPractice() {
  const ids = (useSearchParams().get('aulas') ?? '').split(',');
  const chosen = practiceLessons().filter(({ lesson }) => ids.includes(lesson.id));
  const lessons = chosen.length >= 2 ? chosen : practiceLessons();
  return (
    <div className={`c-gold`}>
      <PracticeScreen
        closeHref="/"
        title="Revisão"
        topics={lessons.map(({ lesson }) => ({ topic: lesson.topic, title: lesson.title }))}
      />
    </div>
  );
}
