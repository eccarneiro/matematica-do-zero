'use client';

const DAY = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

/** XP dos últimos 7 dias em barras, com a meta diária marcada. */
export function WeekChart({ week, goal }: { week: { key: string; date: Date; xp: number }[]; goal: number }) {
  const max = Math.max(goal, ...week.map((d) => d.xp));
  const total = week.reduce((s, d) => s + d.xp, 0);
  return (
    <figure aria-label={`XP nos últimos 7 dias: ${total} no total`}>
      <div className="relative flex h-28 items-end gap-2">
        <div className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-gold/60" style={{ bottom: `${(goal / max) * 100}%` }}>
          <span className="absolute -top-5 right-0 text-[0.65rem] font-extrabold tracking-wider text-gold uppercase">meta</span>
        </div>
        {week.map((d, i) => {
          const isToday = i === week.length - 1;
          const h = d.xp ? Math.max(8, (d.xp / max) * 100) : 4;
          return (
            <div key={d.key} className="flex h-full flex-1 flex-col justify-end" title={`${d.xp} XP`}>
              <div
                className={`origin-bottom rounded-t-lg ${d.xp >= goal ? 'bg-success' : d.xp ? 'bg-accent' : 'bg-surface-2'} ${isToday ? 'ring-2 ring-edge ring-offset-2 ring-offset-surface' : ''}`}
                style={{ height: `${h}%`, animation: `grow-y .7s ${i * 0.06}s cubic-bezier(.2,.8,.2,1) both` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2 text-center text-[0.7rem] font-extrabold text-ink-3">
        {week.map((d, i) => (
          <span key={d.key} className={`flex-1 ${i === week.length - 1 ? 'text-ink' : ''}`}>{DAY[d.date.getDay()]}</span>
        ))}
      </div>
    </figure>
  );
}
