'use client';

import Link from 'next/link';
import { curriculum } from '@/content/curriculum';
import { LEVEL_NAMES } from '@/generators/types';
import { TOPIC_TITLES } from '@/generators/registry';
import { useMounted } from '@/lib/useMounted';
import { useProgress } from '@/progress/store';
import { useGameStats } from '@/progress/useGameStats';
import { GoalRing } from '@/components/layout/GameStats';
import { IconFlame, IconStar } from '@/components/ui/icons';
import { CountUp } from './CountUp';
import { Stamp } from './Stamp';
import { WeekChart } from './WeekChart';

/** Painel do topo: nível, XP, sequência, meta, semana e acerto. */
export function LevelHero() {
  const s = useGameStats();
  const mounted = useMounted();
  if (!mounted) return <div className="card h-56 animate-pulse" />;
  const { level } = s;

  return (
    <section className="grid gap-5 lg:grid-cols-[1.6fr_1fr]" aria-label="Seu progresso">
      <div className="card relative overflow-hidden p-5 sm:p-6">
        <div className="paper pointer-events-none absolute inset-y-0 right-0 hidden w-2/5 opacity-70 sm:block [mask-image:linear-gradient(to_left,black,transparent)]" />
        <div className="relative flex flex-wrap items-center gap-5">
          {/* Medalha do nível */}
          <div className="c-gold relative grid size-24 flex-none place-items-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 size-full animate-[pop_.5s_ease] drop-shadow-[0_6px_10px_rgb(27_31_51/0.18)]" aria-hidden>
              <polygon points="50,3 61,14 76,10 80,25 95,31 89,45 97,58 84,66 83,82 67,82 58,95 46,86 31,93 25,79 9,74 13,59 3,47 14,36 12,20 28,18 36,4" className="f-acc" stroke="var(--edge)" strokeWidth="2.5" strokeLinejoin="round" />
              <circle cx="50" cy="50" r="29" fill="none" stroke="var(--on-accent)" strokeWidth="2" strokeDasharray="3 4" opacity=".6" />
            </svg>
            <span className="relative text-center leading-none text-on-accent">
              <span className="block text-[0.6rem] font-extrabold tracking-widest uppercase">nível</span>
              <span className="block font-display text-[2.1rem] font-bold">{level.level}</span>
            </span>
          </div>
          <div className="min-w-[200px] flex-1">
            <p className="text-[0.72rem] font-extrabold tracking-[0.16em] text-ink-3 uppercase">Seu título</p>
            <h1 className="text-[clamp(1.6rem,3vw,2.2rem)]">{level.title}</h1>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-4 flex-1 overflow-hidden rounded-full border-[1.5px] border-edge bg-surface-2">
                <div className="c-gold h-full origin-left rounded-full bg-accent" style={{ width: `${level.ratio * 100}%`, animation: 'grow-x 1s cubic-bezier(.2,.8,.2,1) both' }} />
              </div>
              <span className="text-[0.85rem] font-extrabold text-ink-2 tabular-nums">{level.into}/{level.needed} XP</span>
            </div>
            <p className="mt-1.5 text-[0.85rem] font-semibold text-ink-3">Faltam {level.needed - level.into} XP para o nível {level.level + 1}.</p>
          </div>
        </div>

        <dl className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric icon={<IconFlame className="size-7" off={!s.studiedToday} />} value={s.streak} label={s.streak === 1 ? 'dia seguido' : 'dias seguidos'} />
          <Metric icon={<IconStar className="size-7" />} value={s.xp} label="XP total" />
          <Metric icon={<GoalRing ratio={s.goalRatio} done={s.goalDone} size={28} />} value={Math.min(s.today, s.goal)} suffix={`/${s.goal}`} label="meta de hoje" />
          <Metric icon={<span className="text-[1.4rem]" aria-hidden>🎯</span>} value={s.accuracy === null ? null : Math.round(s.accuracy * 100)} suffix="%" label="de acerto" />
        </dl>
      </div>

      <div className="card p-5 sm:p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-[1.25rem]">Esta semana</h2>
          <span className="text-[0.85rem] font-extrabold text-ink-3">{s.week.reduce((a, d) => a + d.xp, 0)} XP</span>
        </div>
        <WeekChart week={s.week} goal={s.goal} />
        <p className="mt-3 text-[0.85rem] font-semibold text-ink-3">
          {s.lessonsDone} {s.lessonsDone === 1 ? 'aula concluída' : 'aulas concluídas'} · {s.questions} questões resolvidas
        </p>
      </div>
    </section>
  );
}

function Metric({ icon, value, suffix, label }: { icon: React.ReactNode; value: number | null; suffix?: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-surface-2 px-3 py-2.5">
      <span className="grid size-8 flex-none place-items-center">{icon}</span>
      <div className="min-w-0">
        <dd className="text-[1.25rem] leading-none font-extrabold">
          {value === null ? '–' : <CountUp value={value} />}
          {value !== null && suffix && <span className="text-[0.85rem] text-ink-3">{suffix}</span>}
        </dd>
        <dt className="mt-0.5 truncate text-[0.72rem] font-bold text-ink-3">{label}</dt>
      </div>
    </div>
  );
}

/** Próxima parada da rota, com atalho direto. */
export function NextStop() {
  const progress = useProgress();
  const mounted = useMounted();
  if (!mounted) return null;
  const all = curriculum.flatMap((m) => m.lessons.map((l) => ({ m, l })));
  const next = all.find(({ l }) => l.ready && !progress.lessons[l.id]?.done);
  if (!next) {
    return (
      <div className="card p-5">
        <p className="text-[0.72rem] font-extrabold tracking-[0.16em] text-ink-3 uppercase">Próxima parada</p>
        <p className="mt-1 font-display text-[1.3rem]">Você visitou todas as paradas publicadas!</p>
        <p className="mt-1 text-[0.9rem] text-ink-2">Novos capítulos estão a caminho. Enquanto isso, a revisão mantém tudo fresco.</p>
      </div>
    );
  }
  const { m, l } = next;
  return (
    <div className={`c-${m.color} card overflow-hidden`}>
      <div className="paper flex items-center gap-4 border-b-[1.5px] border-paper-line px-5 py-4">
        <Stamp lesson={l} earned={false} size={64} />
        <div className="min-w-0">
          <p className="text-[0.7rem] font-extrabold tracking-[0.16em] text-paper-ink-2 uppercase">Próxima parada</p>
          <p className="font-display text-[1.35rem] leading-tight text-paper-ink">{l.place}, {l.year}</p>
        </div>
      </div>
      <div className="p-5">
        <p className="text-[1.15rem] font-extrabold">{l.title}</p>
        <p className="mt-0.5 text-[0.92rem] text-ink-2">{l.summary}</p>
        <Link href={`/aula/${l.id}`} className="btn btn-primary mt-4 w-full">Continuar viagem</Link>
      </div>
    </div>
  );
}

/** Passaporte: um selo por aula publicada. */
export function Passport() {
  const progress = useProgress();
  const mounted = useMounted();
  const lessons = curriculum.flatMap((m) => m.lessons.filter((l) => l.ready).map((l) => ({ m, l })));
  const earned = mounted ? lessons.filter(({ l }) => progress.lessons[l.id]?.done).length : 0;
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-[1.25rem]">Passaporte</h2>
        <span className="text-[0.85rem] font-extrabold text-ink-3">{earned}/{lessons.length} selos</span>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {lessons.map(({ m, l }) => (
          <Link key={l.id} href={`/aula/${l.id}`} title={l.title} className={`c-${m.color} grid place-items-center rounded-xl p-1 hover:bg-surface-2`}>
            <Stamp lesson={l} earned={mounted && !!progress.lessons[l.id]?.done} size={64} animate />
          </Link>
        ))}
      </div>
    </div>
  );
}

/** Domínio por tópico: nível e aproveitamento no treino. */
export function Mastery() {
  const progress = useProgress();
  const mounted = useMounted();
  // Um item por tópico de treino (várias micro-aulas compartilham o mesmo tópico).
  const lessons = curriculum
    .flatMap((m) => m.lessons.filter((l) => l.ready && l.topic).map((l) => ({ m, l })))
    .filter(({ l }, i, arr) => arr.findIndex((x) => x.l.topic === l.topic) === i);
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-[1.25rem]">Domínio</h2>
        <Link href="/treino" className="text-[0.85rem] font-extrabold no-underline">Treinar ›</Link>
      </div>
      <ul className="grid gap-3">
        {lessons.map(({ m, l }, i) => {
          const t = mounted ? progress.topics[l.topic!] : undefined;
          const ratio = t?.total ? t.correct / t.total : 0;
          return (
            <li key={l.id} className={`c-${m.color}`}>
              <div className="mb-1 flex items-center justify-between gap-2 text-[0.88rem]">
                <span className="truncate font-extrabold">{TOPIC_TITLES[l.topic!]}</span>
                <span className="flex-none text-[0.75rem] font-extrabold text-ink-3">{t?.total ? LEVEL_NAMES[t.level] : '—'}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full origin-left rounded-full bg-accent" style={{ width: `${ratio * 100}%`, animation: `grow-x .8s ${i * 0.05}s cubic-bezier(.2,.8,.2,1) both` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
