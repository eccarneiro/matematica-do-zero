// Gráficos do painel (série única, uma cor). Cada marca mostra o valor ao
// passar o mouse/tocar; o maior valor e o de hoje também ficam escritos.

const fmtDay = (key: string) => {
  const [, m, d] = key.split('-');
  return `${d}/${m}`;
};

/** Colunas diárias (últimos 30 dias). */
export function DailyColumns({ data, label }: { data: { day: string; value: number }[]; label: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const peak = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <figure aria-label={`${label}: ${total} no total em 30 dias`}>
      <div className="relative flex h-44 items-end gap-[2px] border-b border-line">
        {/* linhas de grade discretas */}
        {[0.5, 1].map((f) => (
          <div key={f} className="pointer-events-none absolute inset-x-0 border-t border-dashed border-line" style={{ bottom: `${f * 100}%` }}>
            <span className="absolute -top-2.5 -left-1 -translate-x-full pr-1 text-[0.65rem] font-semibold text-ink-3 tabular-nums">{Math.round(max * f)}</span>
          </div>
        ))}
        {data.map((d, i) => {
          const isLast = i === data.length - 1;
          const showLabel = d.value > 0 && (i === peak || isLast);
          return (
            <div key={d.day} className="group relative flex h-full flex-1 flex-col justify-end">
              {showLabel && (
                <span className="absolute left-1/2 -translate-x-1/2 text-[0.7rem] font-bold text-ink-2 tabular-nums" style={{ bottom: `calc(${(d.value / max) * 100}% + 4px)` }}>
                  {d.value}
                </span>
              )}
              <div
                className="origin-bottom rounded-t-[4px] bg-chart"
                style={{ height: d.value ? `${Math.max(2, (d.value / max) * 100)}%` : 0, animation: `grow-y .6s ${i * 0.012}s ease both` }}
              />
              {/* tooltip */}
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded-lg bg-ink px-2 py-1 text-[0.72rem] font-semibold whitespace-nowrap text-bg shadow-lift group-hover:block">
                {fmtDay(d.day)}: {d.value}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-[0.7rem] font-semibold text-ink-3">
        <span>{fmtDay(data[0].day)}</span>
        <span>{fmtDay(data[Math.floor(data.length / 2)].day)}</span>
        <span>hoje</span>
      </div>
    </figure>
  );
}

/** Barras horizontais com rótulo e valor escritos (sem depender da cor). */
export function HBars({ data, total, suffix = '' }: { data: { key: string; label: React.ReactNode; value: number }[]; total?: number; suffix?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="grid gap-2.5">
      {data.map((d, i) => (
        <li key={d.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1" title={`${d.value}${suffix}`}>
          <span className="truncate text-[0.88rem] font-semibold">{d.label}</span>
          <span className="text-[0.85rem] font-bold text-ink-2 tabular-nums">
            {d.value}{suffix}
            {total ? <span className="ml-1 font-semibold text-ink-3">({Math.round((100 * d.value) / Math.max(1, total))}%)</span> : null}
          </span>
          <div className="col-span-2 h-2.5 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full origin-left rounded-full bg-chart" style={{ width: `${(d.value / max) * 100}%`, animation: `grow-x .7s ${i * 0.04}s ease both` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
