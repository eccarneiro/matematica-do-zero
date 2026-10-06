'use client';

import Link from 'next/link';
import type { CourseModule } from '@/content/types';
import { useMounted } from '@/lib/useMounted';
import { useProgress } from '@/progress/store';
import { Stamp } from '@/components/dashboard/Stamp';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

/** Guia do capítulo: todas as paradas com resumo, época e selo. */
export function ModuleGuide({ module }: { module: CourseModule }) {
  const progress = useProgress();
  const mounted = useMounted();
  const ready = module.lessons.filter((l) => l.ready);
  const done = mounted ? ready.filter((l) => progress.lessons[l.id]?.done).length : 0;

  return (
    <div className={`c-${module.color}`}>
      <header className="paper relative overflow-hidden rounded-2xl border-2 border-paper-line px-6 py-7 shadow-card sm:px-8">
        <span aria-hidden className={`absolute -right-2 -bottom-8 font-serif text-[10rem] leading-none font-semibold ${ready.length ? 'text-accent/20' : 'text-paper-ink-2/15'}`}>
          {ROMAN[module.number - 1]}
        </span>
        <p className="relative text-[0.72rem] font-extrabold tracking-[0.18em] text-paper-ink-2 uppercase">Capítulo {module.number}</p>
        <h1 className="relative mt-1 text-[clamp(2rem,4vw,2.8rem)] text-paper-ink">{module.title}</h1>
        <p className="relative mt-1 max-w-[52ch] text-[1.05rem] text-paper-ink">{module.tagline}</p>
        <p className="relative mt-1 font-display text-paper-ink-2">{module.eras}</p>
        {ready.length > 0 ? (
          <div className="relative mt-5 flex max-w-md items-center gap-3">
            <div className="h-3 flex-1 overflow-hidden rounded-full border-[1.5px] border-paper-line bg-paper-plaque">
              <div className="h-full origin-left rounded-full bg-accent" style={{ width: `${(100 * done) / ready.length}%`, animation: 'grow-x .8s ease both' }} />
            </div>
            <span className="text-sm font-extrabold text-paper-ink">{done}/{ready.length} selos</span>
          </div>
        ) : (
          <p className="relative mt-4 font-bold text-paper-ink-2">Este capítulo está sendo preparado. As paradas aparecem aqui assim que ficarem prontas.</p>
        )}
      </header>

      <ol className="mt-8 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {module.lessons.map((lesson, i) => {
          const isDone = mounted && !!progress.lessons[lesson.id]?.done;
          const body = (
            <>
              <Stamp lesson={lesson} earned={isDone} size={72} />
              <span className="min-w-0 flex-1">
                <span className="text-[0.72rem] font-extrabold tracking-[0.14em] text-ink-3 uppercase">Parada {i + 1} · {lesson.place}, {lesson.year}</span>
                <span className="block text-[1.05rem] font-extrabold">{lesson.title}</span>
                {lesson.summary && <span className="block text-[0.92rem] text-ink-2">{lesson.summary}</span>}
              </span>
              {!lesson.ready && <span className="badge self-start">em breve</span>}
            </>
          );
          return (
            <li key={lesson.id}>
              {lesson.ready ? (
                <Link href={`/aula/${lesson.id}`} className="tile flex h-full items-center gap-4 p-4">{body}</Link>
              ) : (
                <div className="flex h-full items-center gap-4 rounded-2xl border-[1.5px] border-dashed border-edge-soft p-4 text-ink-3">{body}</div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
