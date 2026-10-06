'use client';

import { progressStore, useProgress } from '@/progress/store';

export function DoneButton({ lessonId }: { lessonId: string }) {
  const done = !!useProgress().lessons[lessonId]?.done;
  return (
    <button
      type="button"
      aria-pressed={done}
      onClick={() => progressStore.setLessonDone(lessonId, !done)}
      className={`btn ${done ? 'btn-soft' : 'btn-primary'}`}
    >
      {done ? '✓ Aula concluída' : 'Marcar aula como concluída'}
    </button>
  );
}
