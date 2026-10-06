'use client';

import Link from 'next/link';
import type { CourseModule } from '@/content/types';
import { useMounted } from '@/lib/useMounted';
import { useProgress } from '@/progress/store';
import { IconCheck, IconLock } from '@/components/ui/icons';

/** Guia da unidade: todas as aulas, com resumo e situação. */
export function ModuleGuide({ module }: { module: CourseModule }) {
  const progress = useProgress();
  const mounted = useMounted();
  const ready = module.lessons.filter((l) => l.ready);
  const done = mounted ? ready.filter((l) => progress.lessons[l.id]?.done).length : 0;

  return (
    <div className={`c-${module.color}`}>
      <header className={`rounded-3xl px-5 py-6 ${ready.length ? 'bg-accent text-on-accent shadow-[0_5px_0_var(--accent-shade)]' : 'bg-surface-2 text-ink-2'}`}>
        <p className="text-[0.72rem] font-black tracking-[0.14em] uppercase opacity-80">Unidade {module.number} · {module.eras}</p>
        <h1 className="mt-1 text-[2.1rem]">{module.title}</h1>
        <p className="mt-1 font-semibold opacity-90">{module.tagline}</p>
        {ready.length > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-black/15">
              <div className="h-full rounded-full bg-surface transition-[width] duration-500" style={{ width: `${(100 * done) / ready.length}%` }} />
            </div>
            <span className="text-sm font-black">{done}/{ready.length}</span>
          </div>
        )}
        {!ready.length && <p className="mt-3 font-bold">Esta unidade está sendo preparada. As aulas aparecem aqui assim que ficarem prontas.</p>}
      </header>

      <ol className="mt-6 grid gap-3">
        {module.lessons.map((lesson, i) => {
          const isDone = mounted && !!progress.lessons[lesson.id]?.done;
          const body = (
            <>
              <span className={`relative grid size-14 flex-none place-items-center rounded-full font-serif text-[1.3rem] font-bold ${lesson.ready ? 'bg-accent text-on-accent shadow-[0_4px_0_var(--accent-shade)]' : 'bg-surface-2 text-ink-3'}`}>
                {lesson.symbol}
                {isDone && (
                  <span className="absolute -right-1 -bottom-1 grid size-6 place-items-center rounded-full border-[3px] border-surface bg-gold text-[#2b1d00]"><IconCheck className="size-3" /></span>
                )}
                {!lesson.ready && (
                  <span className="absolute -right-1 -bottom-1 grid size-6 place-items-center rounded-full border-[3px] border-surface bg-surface-2"><IconLock className="size-3" /></span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-[0.72rem] font-black tracking-[0.12em] text-ink-3 uppercase">Aula {i + 1}</span>
                <span className="block font-black">{lesson.title}</span>
                {lesson.summary && <span className="block text-[0.9rem] text-ink-2">{lesson.summary}</span>}
              </span>
              {!lesson.ready && <span className="badge">em breve</span>}
            </>
          );
          const cls = 'card flex items-center gap-4 p-4';
          return (
            <li key={lesson.id}>
              {lesson.ready ? (
                <Link href={`/aula/${lesson.id}`} className={`${cls} text-ink no-underline shadow-[0_4px_0_var(--line)] active:translate-y-1 active:shadow-none`}>{body}</Link>
              ) : (
                <div className={`${cls} text-ink-3`}>{body}</div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
