import type { ComponentType } from 'react';
import { MathText } from '@/components/MathText';
import type { LessonMeta } from '@/content/types';
import { VideoEmbed } from './VideoEmbed';
import { WorkedExample } from './WorkedExample';

/** 1 · A história: página de livro antigo com a placa de museu. */
export function HistoryStep({ meta, History }: { meta: LessonMeta; History: ComponentType }) {
  const plaque: [string, string | undefined][] = [
    ['Quando', meta.history.when],
    ['Onde', meta.history.where],
    ['Quem', meta.history.who],
  ];
  return (
    <article className="paper relative overflow-hidden rounded-3xl border-2 border-paper-line px-5 pt-6 pb-5 shadow-card sm:px-7">
      <span aria-hidden className="pointer-events-none absolute -top-3 -right-2 font-serif text-[7rem] leading-none text-paper-line/70 italic">§</span>
      <h2 className="relative pr-10 text-[1.75rem] text-paper-ink italic">{meta.history.title}</h2>
      {/* Placa de museu */}
      <dl className="relative mt-4 mb-5 grid gap-x-4 gap-y-1.5 rounded-xl border border-paper-line bg-paper-plaque px-4 py-3 text-[0.92rem] sm:grid-cols-[auto_1fr]">
        {plaque.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-[0.7rem] font-black tracking-[0.16em] text-paper-ink-2 uppercase sm:pt-0.5">{k}</dt>
            <dd className="mb-1 font-serif text-paper-ink sm:mb-0">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="prose prose-history">
        <History />
      </div>
    </article>
  );
}

/** 2 · A ideia: texto com interativos (MDX). */
export function IdeaStep({ Idea }: { Idea: ComponentType }) {
  return (
    <div className="prose">
      <Idea />
    </div>
  );
}

/** 3 · Pra que serve hoje. */
export function UsesStep({ meta }: { meta: LessonMeta }) {
  return (
    <div>
      <h2 className="mb-5 text-[1.7rem]">Onde isso aparece na sua vida</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {meta.uses.map((u, i) => (
          <div key={u.title} className="card flex gap-4 p-4" style={{ animation: `fade-in .35s ${i * 0.06}s ease both` }}>
            <span aria-hidden className="grid size-14 flex-none place-items-center rounded-2xl bg-accent-soft text-[1.8rem]">{u.icon}</span>
            <div>
              <h3 className="font-sans text-[1.05rem] font-black">{u.title}</h3>
              <MathText as="p" text={u.text} className="mt-0.5 text-[0.95rem] text-ink-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 4 · Pra pensar: a pergunta filosófica. */
export function ThinkStep({ meta }: { meta: LessonMeta }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-8 text-bg sm:px-8">
      <span aria-hidden className="absolute -top-14 -right-3 font-serif text-[13rem] leading-none text-accent opacity-30">?</span>
      <p className="relative text-[0.75rem] font-black tracking-[0.16em] uppercase opacity-70">Uma pergunta sem resposta pronta</p>
      <MathText as="p" text={meta.think.question} className="relative mt-3 font-serif text-[1.7rem] leading-tight font-semibold italic" />
      <MathText as="p" text={meta.think.text} className="relative mt-4 text-[1.02rem] leading-relaxed opacity-85" />
      <p className="relative mt-6 text-[0.85rem] font-bold opacity-60">Pare um minuto e pense na sua resposta antes de continuar.</p>
    </div>
  );
}

/** 5 · Videoaulas. */
export function VideosStep({ meta }: { meta: LessonMeta }) {
  return (
    <div>
      <h2 className="mb-1 text-[1.7rem]">Quer ver alguém explicando?</h2>
      <p className="mb-5 text-ink-2">Videoaulas em português de professores que admiramos. São opcionais: pode seguir quando quiser.</p>
      <div className="grid gap-5">
        {meta.videos.map((v) => (
          <VideoEmbed key={v.id} video={v} />
        ))}
      </div>
    </div>
  );
}

/** 6 · Exemplos resolvidos. */
export function ExamplesStep({ meta }: { meta: LessonMeta }) {
  return (
    <div>
      <h2 className="mb-1 text-[1.7rem]">Vamos resolver juntos</h2>
      <p className="mb-5 text-ink-2">Tente pensar em cada passo antes de revelar.</p>
      <div className="grid gap-4">
        {meta.examples.map((ex, i) => (
          <WorkedExample key={i} n={i + 1} example={ex} />
        ))}
      </div>
    </div>
  );
}
