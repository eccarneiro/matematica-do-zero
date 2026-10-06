'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { curriculum } from '@/content/curriculum';
import type { LessonRef } from '@/content/types';
import { useMounted } from '@/lib/useMounted';
import { XP } from '@/progress/model';
import { useProgress } from '@/progress/store';
import { Stamp } from '@/components/dashboard/Stamp';
import { buildTrail, type NodeState, type TrailNode, type TrailUnit } from './trailModel';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

/**
 * Itinerário pela história: cada unidade é um capítulo e cada aula, uma
 * parada (ano + lugar) com seu selo de passaporte.
 */
export function Itinerary() {
  const progress = useProgress();
  const mounted = useMounted();
  const units = useMemo(() => buildTrail(curriculum, progress), [progress]);

  return (
    <div className={`grid gap-16 ${mounted ? '' : 'invisible'}`}>
      {units.map((unit) => (
        <section key={unit.module.id} className={`c-${unit.module.color}`} aria-label={`Capítulo ${unit.module.number}: ${unit.module.title}`}>
          <ChapterHeader unit={unit} />
          {unit.ready ? <Route unit={unit} /> : <Upcoming unit={unit} />}
        </section>
      ))}
    </div>
  );
}

function ChapterHeader({ unit }: { unit: TrailUnit }) {
  const { module, done, ready } = unit;
  return (
    <header className="mb-8 flex items-end gap-5 border-b-[1.5px] border-edge-soft pb-5">
      <span className={`font-serif text-[clamp(3.5rem,8vw,5.5rem)] leading-[0.8] font-bold ${ready ? 'text-accent' : 'text-ink-3/40'}`} aria-hidden>
        {ROMAN[module.number - 1]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.72rem] font-black tracking-[0.18em] text-ink-3 uppercase">Capítulo {module.number}</p>
        <h2 className="text-[clamp(1.7rem,3.5vw,2.4rem)]">{module.title}</h2>
        <p className="mt-0.5 font-serif text-[1rem] text-ink-2 italic">{module.eras}</p>
      </div>
      {ready ? (
        <Link href={`/modulo/${module.id}`} className="btn btn-ghost hidden min-h-10 flex-none px-4 py-2 text-[0.9rem] sm:inline-flex">
          Guia · {done}/{ready} selos
        </Link>
      ) : (
        <span className="badge flex-none">em breve</span>
      )}
    </header>
  );
}

/** Rota com as paradas: alternando lados no computador, uma coluna no celular. */
function Route({ unit }: { unit: TrailUnit }) {
  return (
    <ol className="relative grid gap-y-3">
      {unit.nodes.map((node, i) => {
        const last = i === unit.nodes.length - 1;
        const nextWalked = !last && isWalked(unit.nodes[i + 1].state);
        return node.kind === 'review' ? (
          <ReviewStop key={node.id} node={node} walkedBelow={nextWalked} last={last} />
        ) : (
          <Stop key={node.lesson.id} lesson={node.lesson} state={node.state} side={i % 2 ? 'right' : 'left'} walkedBelow={nextWalked} last={last} />
        );
      })}
    </ol>
  );
}

const isWalked = (s: NodeState) => s === 'done' || s === 'current';

/** Pedaço da linha da rota que passa por trás de cada parada. */
function RouteLine({ walked, half }: { walked: boolean; half: 'top' | 'bottom' }) {
  return (
    <span
      aria-hidden
      className={`absolute left-1/2 w-[3px] -translate-x-1/2 ${half === 'top' ? 'top-[-12px] h-[calc(50%+12px)]' : 'top-1/2 h-1/2'} ${
        walked ? 'bg-accent' : 'bg-[repeating-linear-gradient(to_bottom,var(--ink-3)_0_6px,transparent_6px_13px)] opacity-40'
      }`}
    />
  );
}

function Stop({ lesson, state, side, walkedBelow, last }: { lesson: LessonRef; state: NodeState; side: 'left' | 'right'; walkedBelow: boolean; last: boolean }) {
  const current = state === 'current';
  const done = state === 'done';
  const card = (
    <article
      className={`card relative p-4 sm:p-5 ${current ? 'border-2 border-accent [animation:glow_2.4s_ease-in-out_infinite]' : ''} ${state === 'open' || state === 'soon' ? 'opacity-80' : ''}`}
    >
      <p className="font-serif text-[0.95rem] text-ink-2 italic md:hidden">{lesson.place} · {lesson.year}</p>
      <h3 className="font-sans text-[1.15rem] font-black">{lesson.title}</h3>
      {lesson.summary && <p className="mt-0.5 text-[0.93rem] text-ink-2">{lesson.summary}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {current && (
          <>
            <Link href={`/aula/${lesson.id}`} className="btn btn-primary min-h-11 py-2">Começar · +{XP.lessonDone} XP</Link>
            <span className="text-[0.8rem] font-black tracking-wide text-accent uppercase">Você está aqui</span>
          </>
        )}
        {done && (
          <>
            <span className="mr-auto text-[0.8rem] font-black tracking-wide text-success uppercase">✓ Selo conquistado</span>
            <Link href={`/aula/${lesson.id}`} className="btn btn-ghost min-h-9 px-3 py-1.5 text-[0.85rem]">Rever</Link>
            <Link href={`/treino/${lesson.id}`} className="btn btn-ghost min-h-9 px-3 py-1.5 text-[0.85rem]">Treinar</Link>
          </>
        )}
        {state === 'open' && (
          <Link href={`/aula/${lesson.id}`} className="text-[0.9rem] font-extrabold no-underline">Visitar fora de ordem ›</Link>
        )}
      </div>
    </article>
  );
  const place = (
    <div className={`hidden md:block ${side === 'left' ? 'text-left' : 'text-right'}`}>
      <p className={`font-serif text-[2.2rem] leading-none font-bold ${isWalked(state) ? 'text-ink' : 'text-ink-3'}`}>{lesson.year}</p>
      <p className="mt-1 text-[0.75rem] font-black tracking-[0.2em] text-ink-3 uppercase">{lesson.place}</p>
    </div>
  );

  return (
    <li className="relative grid grid-cols-[64px_1fr] items-center gap-x-4 [animation:fade-in_.6s_ease_both] md:grid-cols-[1fr_96px_1fr] md:gap-x-6">
      <div className={side === 'left' ? 'order-2 md:order-1' : 'order-2 md:order-3'}>{card}</div>
      <div className="relative order-1 grid h-full min-h-24 place-items-center md:order-2">
        <RouteLine walked={isWalked(state)} half="top" />
        {!last && <RouteLine walked={walkedBelow} half="bottom" />}
        <Link
          href={state === 'soon' ? '#' : `/aula/${lesson.id}`}
          aria-label={lesson.title}
          className={`relative grid place-items-center rounded-full bg-bg p-1 ${state === 'soon' ? 'pointer-events-none' : ''}`}
        >
          <span className="md:hidden"><Stamp lesson={lesson} earned={done} size={60} /></span>
          <span className="hidden md:block"><Stamp lesson={lesson} earned={done} size={90} /></span>
          {current && <span className="absolute inset-0 animate-ping rounded-full border-2 border-accent opacity-40" aria-hidden />}
        </Link>
      </div>
      <div className={side === 'left' ? 'order-3 hidden md:block' : 'order-1 hidden md:block'}>{place}</div>
    </li>
  );
}

function ReviewStop({ node, walkedBelow, last }: { node: Extract<TrailNode, { kind: 'review' }>; walkedBelow: boolean; last: boolean }) {
  const lessons = curriculum.flatMap((m) => m.lessons).filter((l) => node.lessonIds.includes(l.id));
  const soon = node.state === 'soon';
  return (
    <li className="relative grid grid-cols-[64px_1fr] items-center gap-x-4 md:grid-cols-[1fr_96px_1fr] md:gap-x-6">
      <div className="relative row-span-2 grid h-full min-h-24 place-items-center md:col-start-2 md:row-span-1 md:row-start-1">
        <RouteLine walked={node.state === 'done'} half="top" />
        {!last && <RouteLine walked={walkedBelow} half="bottom" />}
        <span className="c-gold relative grid size-12 rotate-45 place-items-center rounded-lg border-2 border-edge bg-accent shadow-[3px_3px_0_var(--edge)]">
          <span className="-rotate-45 text-[1.2rem] font-black text-on-accent">✦</span>
        </span>
      </div>
      <div className="col-start-2 self-end md:col-start-1 md:row-start-1 md:self-center md:text-right">
        <p className="text-[0.72rem] font-black tracking-[0.16em] text-ink-3 uppercase">Parada de revisão</p>
        <p className="font-serif text-[1.15rem]">{lessons.map((l) => l.symbol).join('  ·  ')}</p>
      </div>
      <div className="col-start-2 self-start md:col-start-3 md:row-start-1 md:self-center">
        {soon ? (
          <p className="text-[0.85rem] font-bold text-ink-3">Abre com duas aulas publicadas.</p>
        ) : (
          <Link href={`/treino/revisao?aulas=${node.lessonIds.join(',')}`} className="btn btn-ghost c-gold min-h-10 py-2 text-[0.9rem]">
            Revisar {lessons.length} paradas
          </Link>
        )}
      </div>
    </li>
  );
}

/** Capítulo ainda não publicado: prévia das paradas. */
function Upcoming({ unit }: { unit: TrailUnit }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Paradas que virão">
      {unit.module.lessons.map((l) => (
        <li key={l.id} className="flex items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-edge-soft px-3 py-2.5 text-ink-3">
          <Stamp lesson={l} earned={false} size={46} />
          <div className="min-w-0">
            <p className="truncate font-extrabold text-ink-2">{l.title}</p>
            <p className="font-serif text-[0.85rem] italic">{l.place} · {l.year}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
