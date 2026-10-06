'use client';

import { useMounted } from '@/lib/useMounted';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { curriculum } from '@/content/curriculum';
import { IconCheck, IconLock, IconStar } from '@/components/ui/icons';
import { useProgress } from '@/progress/store';
import { XP } from '@/progress/model';
import { buildTrail, nodeOffset, type TrailNode, type TrailUnit } from './trailModel';

const ROW = 124; // altura de cada linha da trilha (px)
const COL = 320; // largura da coluna da trilha (px)
const CX = COL / 2;

export function Trail() {
  const progress = useProgress();
  const units = useMemo(() => buildTrail(curriculum, progress), [progress]);
  const mounted = useMounted();

  return (
    <div className="grid gap-12">
      {units.map((unit) => (
        <section key={unit.module.id} className={`c-${unit.module.color}`} aria-label={`Unidade ${unit.module.number}: ${unit.module.title}`}>
          <UnitBanner unit={unit} />
          {/* A trilha depende do progresso salvo no aparelho: só aparece depois de montar. */}
          <div className={mounted ? 'animate-[fade-in_.4s_ease]' : 'invisible'}>
            {unit.ready ? <TrailPath unit={unit} /> : <SoonPreview unit={unit} />}
          </div>
        </section>
      ))}
    </div>
  );
}

function UnitBanner({ unit }: { unit: TrailUnit }) {
  const { module, done, ready } = unit;
  const soon = ready === 0;
  return (
    <header
      className={`sticky top-[58px] z-10 overflow-hidden rounded-3xl px-5 py-4 md:top-4 ${soon ? 'bg-surface-2 text-ink-2' : 'bg-accent text-on-accent shadow-[0_5px_0_var(--accent-shade)]'}`}
    >
      <Astrolabe className={`pointer-events-none absolute -right-8 -bottom-10 size-40 ${soon ? 'opacity-[0.07]' : 'opacity-20'}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.72rem] font-black tracking-[0.16em] uppercase opacity-80">Unidade {module.number}</p>
          <h2 className="mt-0.5 text-[1.7rem]">{module.title}</h2>
        </div>
        {soon ? (
          <span className="mt-1 flex-none rounded-full bg-bg px-3 py-1 text-[0.7rem] font-extrabold tracking-widest text-ink-3 uppercase">em breve</span>
        ) : (
          <Link
            href={`/modulo/${module.id}`}
            className="mt-1 flex-none rounded-2xl border-2 border-current/35 bg-black/5 px-3 py-1.5 text-[0.75rem] font-extrabold tracking-wider text-current uppercase no-underline"
          >
            Guia · {done}/{ready}
          </Link>
        )}
      </div>
      <p className="relative mt-1 max-w-[34ch] text-[0.92rem] leading-snug font-semibold opacity-90">{module.tagline}</p>
      <p className="relative mt-2 font-serif text-[0.85rem] italic opacity-80">{module.eras}</p>
    </header>
  );
}

function TrailPath({ unit }: { unit: TrailUnit }) {
  const [open, setOpen] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const points = unit.nodes.map((_, i) => ({ x: CX + nodeOffset(i), y: i * ROW + 62 }));
  const height = unit.nodes.length * ROW + 8;

  // Fecha o cartão ao tocar fora.
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(null); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  // Caminho: curvas suaves entre os centros das bolinhas.
  const seg = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    `M${a.x} ${a.y} C ${a.x} ${(a.y + b.y) / 2}, ${b.x} ${(a.y + b.y) / 2}, ${b.x} ${b.y}`;

  return (
    <div ref={box} className="relative mx-auto mt-6" style={{ width: COL, height }}>
      <svg className="absolute inset-0" width={COL} height={height} aria-hidden>
        {points.slice(1).map((p, i) => {
          const walked = unit.nodes[i + 1].state === 'done' || unit.nodes[i + 1].state === 'current';
          return (
            <path
              key={i}
              d={seg(points[i], p)}
              fill="none"
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={walked ? undefined : '0.1 16'}
              stroke={walked ? 'var(--accent-soft)' : 'var(--line)'}
            />
          );
        })}
      </svg>
      {unit.nodes.map((node, i) => {
        const id = node.kind === 'lesson' ? node.lesson.id : node.id;
        return (
          <div key={id} className="absolute" style={{ left: points[i].x, top: points[i].y, transform: 'translate(-50%, -50%)', zIndex: open === id ? 5 : 1 }}>
            <TrailButton node={node} onClick={() => setOpen(open === id ? null : id)} active={open === id} />
            {open === id && <NodeCard node={node} offset={nodeOffset(i)} />}
          </div>
        );
      })}
    </div>
  );
}

function TrailButton({ node, onClick, active }: { node: TrailNode; onClick: () => void; active: boolean }) {
  const { state } = node;
  const lit = state === 'done' || state === 'current';
  const isReview = node.kind === 'review';
  const label = isReview ? 'Revisão' : node.lesson.title;
  const symbol = isReview ? null : node.lesson.symbol;

  return (
    <div className={`relative ${isReview && state !== 'soon' ? 'c-gold' : ''}`}>
      {state === 'current' && (
        <span className="absolute -top-12 left-1/2 z-10 animate-[bob_1.6s_ease-in-out_infinite] rounded-xl border-2 border-line bg-surface px-3 py-1.5 text-[0.8rem] font-extrabold tracking-wider whitespace-nowrap text-accent uppercase shadow-card" style={{ transform: 'translateX(-50%)' }}>
          Começar
          <span className="absolute -bottom-[7px] left-1/2 size-3 -translate-x-1/2 rotate-45 border-r-2 border-b-2 border-line bg-surface" />
        </span>
      )}
      <button
        type="button"
        onClick={onClick}
        aria-label={`${label}${state === 'done' ? ' (concluída)' : state === 'soon' ? ' (em breve)' : ''}`}
        aria-expanded={active}
        className={`grid cursor-pointer place-items-center rounded-full font-serif font-bold transition-transform active:translate-y-[6px] ${
          isReview ? 'size-[68px]' : 'size-[76px]'
        } ${lit || (isReview && state !== 'soon') ? 'bg-accent text-on-accent shadow-[0_7px_0_var(--accent-shade)] active:shadow-none' : 'bg-surface-2 text-ink-3 shadow-[0_7px_0_var(--line)] active:shadow-none'} ${
          state === 'current' ? 'animate-[pulse-ring_1.8s_ease-out_infinite]' : ''
        } ${state === 'soon' ? 'opacity-70' : ''}`}
      >
        {isReview ? (
          <IconStar className={`size-9 ${state === 'soon' ? 'grayscale opacity-50' : ''}`} />
        ) : (
          <span className={symbol!.length > 2 ? 'text-[1.15rem]' : 'text-[1.7rem]'}>{symbol}</span>
        )}
      </button>
      {state === 'done' && !isReview && (
        <span className="absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full border-[3px] border-bg bg-gold text-[#2b1d00]">
          <IconCheck className="size-3.5" />
        </span>
      )}
      {state === 'soon' && (
        <span className="absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full border-[3px] border-bg bg-surface-2 text-ink-3">
          <IconLock className="size-3.5" />
        </span>
      )}
    </div>
  );
}

/** Unidade ainda não publicada: só uma prévia das aulas que virão. */
function SoonPreview({ unit }: { unit: TrailUnit }) {
  return (
    <ul className="mt-4 flex flex-wrap justify-center gap-2.5 px-2" aria-label="Aulas que virão">
      {unit.module.lessons.map((l) => (
        <li key={l.id} title={l.title} className="grid size-12 place-items-center rounded-full bg-surface-2 font-serif text-[1rem] font-bold text-ink-3 shadow-[0_4px_0_var(--line)]">
          {l.symbol}
        </li>
      ))}
    </ul>
  );
}

/** Cartão que abre ao tocar numa bolinha. */
function NodeCard({ node, offset }: { node: TrailNode; offset: number }) {
  const soon = node.state === 'soon';
  const isReview = node.kind === 'review';
  const title = isReview ? 'Revisão' : node.lesson.title;
  const text = isReview
    ? soon
      ? 'A revisão abre quando houver pelo menos duas aulas publicadas antes dela.'
      : 'Treino misto com as aulas anteriores desta unidade. Ótimo para fixar.'
    : soon
      ? 'Esta aula está sendo preparada e chega em breve.'
      : node.lesson.summary ?? '';
  const href = isReview ? `/treino/revisao?aulas=${node.lessonIds.join(',')}` : !soon ? `/aula/${node.lesson.id}` : null;
  const cta =
    isReview ? 'Praticar' : node.state === 'done' ? 'Rever aula' : node.state === 'current' ? `Começar +${XP.lessonDone} XP` : 'Começar mesmo assim';

  return (
    <div
      className={`absolute top-[88px] z-20 w-[280px] animate-[pop_.22s_ease] rounded-3xl p-4 ${soon ? 'border-2 border-line bg-surface' : 'bg-accent text-on-accent shadow-[0_5px_0_var(--accent-shade)]'}`}
      style={{ left: `calc(50% - 140px - ${offset}px)` }}
      role="dialog"
      aria-label={title}
    >
      <span
        className={`absolute -top-2 size-4 rotate-45 ${soon ? 'border-t-2 border-l-2 border-line bg-surface' : 'bg-accent'}`}
        style={{ left: `calc(50% - 8px + ${offset}px)` }}
      />
      <p className="text-[1.15rem] leading-tight font-black">{title}</p>
      <p className={`mt-1 text-[0.92rem] font-semibold ${soon ? 'text-ink-2' : 'opacity-90'}`}>{text}</p>
      {node.state === 'open' && !isReview && (
        <p className="mt-1.5 text-[0.8rem] font-bold opacity-80">Dica: a trilha funciona melhor na ordem, mas você pode pular.</p>
      )}
      {href && (
        <Link
          href={href}
          className="mt-3.5 flex min-h-12 items-center justify-center rounded-2xl bg-surface px-4 text-[0.95rem] font-extrabold tracking-wide text-accent uppercase no-underline shadow-[0_4px_0_rgb(0_0_0/0.15)] active:translate-y-1 active:shadow-none"
        >
          {cta}
        </Link>
      )}
    </div>
  );
}

/** Ornamento inspirado em astrolábios: o toque "museu" das faixas de unidade. */
function Astrolabe({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="50" cy="50" r="46" />
      <circle cx="50" cy="50" r="36" />
      <circle cx="50" cy="50" r="12" />
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i * Math.PI) / 12;
        const r1 = i % 2 ? 41 : 38;
        return <line key={i} x1={50 + Math.cos(a) * r1} y1={50 + Math.sin(a) * r1} x2={50 + Math.cos(a) * 46} y2={50 + Math.sin(a) * 46} />;
      })}
      <path d="M14 50h72M50 14v72M24 24l52 52M76 24L24 76" strokeDasharray="2 3" />
      <path d="M50 50L78 30" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
