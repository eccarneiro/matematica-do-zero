'use client';

import { useMounted } from '@/lib/useMounted';
import { IconFlame, IconStar } from '@/components/ui/icons';
import { useGameStats } from '@/progress/useGameStats';

/** Anel da meta diária. */
export function GoalRing({ ratio, size = 30, done }: { ratio: number; size?: number; done: boolean }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={5} className="s-line" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={5} strokeLinecap="round"
        stroke={done ? 'var(--right)' : 'var(--gold)'} strokeDasharray={c} strokeDashoffset={c * (1 - ratio)}
        style={{ transition: 'stroke-dashoffset .6s ease' }}
      />
    </svg>
  );
}

/** Sequência, XP e meta do dia, lado a lado (topo no celular). */
export function StatChips() {
  const s = useGameStats();
  const mounted = useMounted();
  const n = (v: number) => (mounted ? v : '–');
  return (
    <div className="flex items-center gap-3.5 text-[0.95rem] font-extrabold">
      <span className={`flex items-center gap-1 ${s.studiedToday ? 'text-flame' : 'text-ink-3'}`} title="Dias seguidos estudando">
        <IconFlame className="size-6" off={!mounted || !s.studiedToday} /> {n(s.streak)}
      </span>
      <span className="flex items-center gap-1 text-gold" title="XP total">
        <IconStar className="size-6" /> {n(s.xp)}
      </span>
      <span className="flex items-center gap-1.5 text-ink-2" title={`Meta do dia: ${s.goal} XP`}>
        <GoalRing ratio={mounted ? s.goalRatio : 0} done={mounted && s.goalDone} size={26} />
        <span className="text-[0.8rem]">{mounted ? `${Math.min(s.today, s.goal)}/${s.goal}` : ''}</span>
      </span>
    </div>
  );
}

/** Cartões da coluna direita (computador). */
export function StatCards() {
  const s = useGameStats();
  const mounted = useMounted();
  if (!mounted) return <div className="card h-48 animate-pulse" />;
  return (
    <div className="grid gap-4">
      <div className="card flex items-center gap-4 p-5">
        <IconFlame className="size-12 flex-none" off={!s.studiedToday} />
        <div>
          <p className="text-2xl font-black">{s.streak} {s.streak === 1 ? 'dia' : 'dias'}</p>
          <p className="text-sm text-ink-2">
            {s.streak === 0 ? 'Estude hoje para acender sua sequência.' : s.studiedToday ? 'Sequência garantida hoje!' : 'Estude hoje para não perder a sequência.'}
          </p>
        </div>
      </div>
      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-extrabold">Meta do dia</p>
          <p className="text-sm font-bold text-ink-3">{Math.min(s.today, s.goal)}/{s.goal} XP</p>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{ width: `${s.goalRatio * 100}%`, background: s.goalDone ? 'var(--right)' : 'var(--gold)' }}
          />
        </div>
        <p className="mt-2 text-sm text-ink-2">{s.goalDone ? 'Meta cumprida. Mandou bem!' : 'Acertos valem 10 XP; concluir uma aula vale 20.'}</p>
      </div>
      <div className="card flex items-center gap-4 p-5">
        <IconStar className="size-12 flex-none" />
        <div>
          <p className="text-2xl font-black">{s.xp} XP</p>
          <p className="text-sm text-ink-2">no total</p>
        </div>
      </div>
    </div>
  );
}
