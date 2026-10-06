/** Moldura comum dos desenhos interativos. */
export function Interactive({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <figure className="card not-prose my-7 p-4 shadow-[3px_3px_0_var(--edge-soft)]">
      <figcaption className="mb-3 flex items-center gap-2 text-[0.75rem] font-black tracking-[0.14em] text-accent uppercase before:content-['✦']">
        {title}
      </figcaption>
      {children}
      {hint && <p className="mt-3 text-center text-[0.82rem] font-bold text-ink-3">{hint}</p>}
    </figure>
  );
}

export function Slider({
  label, value, min, max, step = 1, onChange, format = String,
}: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; format?: (v: number) => string;
}) {
  return (
    <label className="flex flex-wrap items-center gap-2.5">
      <span className="min-w-[7.5em] text-[0.9rem] font-bold text-ink-2">{label}</span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-7 min-w-[140px] flex-1 accent-accent"
      />
      <output className="min-w-[3ch] text-right font-black text-ink tabular-nums">{format(value)}</output>
    </label>
  );
}

export function Toggle<T extends string>({
  options, value, onChange, label,
}: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`min-h-11 cursor-pointer rounded-2xl border-2 px-4 py-2 text-[0.92rem] font-extrabold active:translate-x-[3px] active:translate-y-[3px] active:shadow-none ${value === o.value ? 'border-accent bg-accent-soft text-accent shadow-[3px_3px_0_var(--edge)]' : 'border-line bg-surface text-ink-2 shadow-[3px_3px_0_var(--edge-soft)]'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Readout({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 min-h-[2.6em] rounded-2xl bg-surface-2 p-3 text-center text-[1.05rem]">{children}</div>;
}
