'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FocusHeader } from '@/components/focus/FocusHeader';
import { IconCheck, IconStar } from '@/components/ui/icons';
import { BRANCH_KINDS, branchKey } from '@/content/branches';
import type { BranchKind, QuizQuestion, Source } from '@/content/types';
import { useMounted } from '@/lib/useMounted';
import { XP } from '@/progress/model';
import { progressStore, useProgress } from '@/progress/store';
import { BranchQuiz } from './BranchQuiz';

export interface LinkTarget {
  id: string;
  title: string;
  href: string | null;
  /** 'aula' ou um tipo de ramo */
  kind: 'aula' | BranchKind;
}

/** Ramo do rizoma: texto, exercícios (quando houver), fontes e conexões. */
export function BranchView({
  id, title, kind, summary, from, links, quiz, sources, children,
}: {
  id: string;
  title: string;
  kind: BranchKind;
  summary: string;
  from: LinkTarget[];
  links: LinkTarget[];
  quiz?: QuizQuestion[];
  sources: Source[];
  children: React.ReactNode;
}) {
  const mounted = useMounted();
  const progress = useProgress();
  const done = mounted && !!progress.lessons[branchKey(id)]?.done;
  const [quizDone, setQuizDone] = useState(false);
  const [justEarned, setJustEarned] = useState(false);
  const canFinish = !quiz?.length || quizDone || done;
  const info = BRANCH_KINDS[kind];

  function finish() {
    const xp = progressStore.setLessonDone(branchKey(id), true);
    if (xp) setJustEarned(true);
  }

  const doneBox = (
    <div className="card p-5">
      {done ? (
        <div className="text-center">
          <span className={`mx-auto grid size-14 place-items-center rounded-full bg-accent text-on-accent ${justEarned ? 'animate-[pop_.5s_ease]' : ''}`}>
            <IconCheck className="size-7" />
          </span>
          <p className="mt-2 font-extrabold">Ramo explorado</p>
          {justEarned && <p className="flex items-center justify-center gap-1 text-[0.9rem] font-bold text-gold"><IconStar className="size-4" /> +{XP.branchDone} XP · selo extra</p>}
        </div>
      ) : (
        <>
          <p className="mb-3 text-[0.9rem] text-ink-2">
            {canFinish ? 'Terminou a leitura? Marque o ramo como explorado.' : 'Faça os exercícios acima para concluir o ramo.'}
          </p>
          <button type="button" disabled={!canFinish} onClick={finish} className="btn btn-primary w-full">
            Concluir ramo · +{XP.branchDone} XP
          </button>
        </>
      )}
    </div>
  );

  const connections = (
    <div className="card p-5">
      <p className="mb-3 text-[0.75rem] font-extrabold tracking-[0.14em] text-ink-3 uppercase">Continue explorando</p>
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-2">
        {links.map((l) => {
          const k = l.kind === 'aula' ? null : BRANCH_KINDS[l.kind];
          const body = (
            <>
              <span className="text-[1.1rem]" aria-hidden>{k ? k.icon : '📍'}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.72rem] font-bold text-ink-3">{k ? k.label : 'Aula do tronco'}</span>
                <span className="block truncate font-bold">{l.title}</span>
              </span>
              {!l.href && <span className="badge">em breve</span>}
            </>
          );
          return (
            <li key={l.id}>
              {l.href ? (
                <Link href={l.href} className="tile flex items-center gap-3 px-3 py-2.5">{body}</Link>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl border border-dashed border-edge px-3 py-2.5 text-ink-3">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
      <Link href="/mapa" className="btn btn-ghost mt-4 w-full">Ver no mapa</Link>
    </div>
  );

  return (
    <div className={`c-${info.color} flex min-h-dvh flex-col`}>
      <FocusHeader wide closeHref="/mapa" />
      <div className="mx-auto flex w-full max-w-[1320px] flex-1 justify-center gap-10 px-4 pb-16 lg:px-8">
        <article className="max-w-[760px] min-w-0 flex-1">
          <p className="pill">{info.icon} {info.label}</p>
          <h1 className="mt-3 text-[clamp(1.8rem,5vw,2.5rem)]">{title}</h1>
          <p className="mt-2 text-[1.1rem] text-ink-2">{summary}</p>
          <p className="mt-3 text-[0.9rem] text-ink-3">
            Sai de:{' '}
            {from.map((f, i) => (
              <span key={f.id}>{i > 0 && ', '}{f.href ? <Link href={f.href}>{f.title}</Link> : f.title}</span>
            ))}
          </p>

          <div className="prose mt-8">{children}</div>

          {quiz && quiz.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-[1.5rem]">{kind === 'desafio' ? 'Encare o desafio' : 'Pratique'}</h2>
              <BranchQuiz questions={quiz} onFinish={() => setQuizDone(true)} />
            </section>
          )}

          <section className="mt-10 border-t border-line pt-6">
            <h2 className="mb-3 text-[1.2rem]">Fontes</h2>
            <ol className="grid gap-2 text-[0.92rem]">
              {sources.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-ink-3">{i + 1}.</span>
                  <span>
                    {s.author}. {s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer"><i>{s.title}</i></a> : <i>{s.title}</i>}
                    {s.year && <>, {s.year}</>}. <span className="text-ink-3">({s.kind})</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-5 lg:hidden">
            {doneBox}
            {connections}
          </div>
        </article>
        <aside className="sticky top-20 hidden h-fit w-[320px] flex-none gap-5 lg:grid">
          {doneBox}
          {connections}
        </aside>
      </div>
    </div>
  );
}
