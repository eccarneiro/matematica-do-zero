'use client';

import Link from 'next/link';
import type { CourseModule } from '@/content/types';
import { useProgress } from '@/progress/store';

/** Cartão de um módulo com suas aulas e o progresso do aluno. */
export function ModuleCard({ module, asPage = false }: { module: CourseModule; asPage?: boolean }) {
  const progress = useProgress();
  const ready = module.lessons.filter((l) => l.ready);
  const done = ready.filter((l) => progress.lessons[l.id]?.done).length;
  const soon = ready.length === 0;
  const Title = asPage ? 'h1' : 'h2';

  return (
    <article className={`card c-${module.color} px-4 pt-[18px] pb-2.5`}>
      <header className="flex items-start gap-3.5">
        <span
          className={`grid size-11 flex-none place-items-center rounded-[14px] font-serif text-[1.3rem] font-semibold ${soon ? 'bg-surface-2 text-ink-3' : 'bg-accent-soft text-accent'}`}
        >
          {module.number}
        </span>
        <div className="min-w-0 flex-1">
          <Title className="mb-0.5 text-[1.4rem]">
            {asPage ? module.title : <Link href={`/modulo/${module.id}`} className="text-ink no-underline">{module.title}</Link>}
          </Title>
          <p className="text-[0.93rem] text-ink-2">{module.tagline}</p>
        </div>
        {soon ? <span className="badge">em breve</span> : <span className="text-sm font-medium text-ink-2">{done}/{ready.length}</span>}
      </header>

      {!soon && (
        <div className="mt-3.5 mb-1 h-1.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={done} aria-valuemax={ready.length} aria-label={`${done} de ${ready.length} aulas concluídas`}>
          <span className="block h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${(100 * done) / ready.length}%` }} />
        </div>
      )}
      {soon && asPage && <p className="mt-3 text-sm text-ink-2">Este módulo está sendo preparado. As aulas aparecem aqui assim que ficarem prontas.</p>}

      <ol className="mt-2.5">
        {module.lessons.map((lesson, i) => {
          const isDone = !!progress.lessons[lesson.id]?.done;
          const body = (
            <>
              <span
                className={`grid size-[30px] flex-none place-items-center rounded-full border-[1.5px] text-sm font-medium ${isDone ? 'border-accent bg-accent text-on-accent' : 'border-line text-ink-2'}`}
              >
                {isDone ? '✓' : i + 1}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-normal">{lesson.title}</span>
                {lesson.summary && <span className="text-[0.84rem] leading-snug text-ink-3">{lesson.summary}</span>}
              </span>
              {lesson.ready ? <span aria-hidden className="text-2xl text-ink-3">›</span> : <span className="badge">em breve</span>}
            </>
          );
          const row = 'flex items-center gap-3 rounded-[10px] border-t border-line px-1.5 py-2.5';
          return (
            <li key={lesson.id}>
              {lesson.ready ? (
                <Link href={`/aula/${lesson.id}`} className={`${row} text-ink no-underline hover:bg-surface-2`}>{body}</Link>
              ) : (
                <div className={`${row} text-ink-3`} aria-disabled>{body}</div>
              )}
            </li>
          );
        })}
      </ol>
    </article>
  );
}
