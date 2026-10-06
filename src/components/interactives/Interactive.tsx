/** Moldura comum dos desenhos interativos. */
export function Interactive({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <figure className="card not-prose my-6 p-3.5">
      <figcaption className="mb-2 flex items-center gap-1.5 text-[0.78rem] font-semibold tracking-[0.08em] text-accent uppercase before:size-2 before:rounded-full before:bg-accent">
        {title}
      </figcaption>
      {children}
      {hint && <p className="mt-2 text-center text-[0.82rem] text-ink-3">{hint}</p>}
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
      <span className="min-w-[7.5em] text-[0.9rem] text-ink-2">{label}</span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-7 min-w-[140px] flex-1 accent-accent"
      />
      <output className="min-w-[3ch] text-right font-semibold text-ink tabular-nums">{format(value)}</output>
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
          className={`min-h-10 cursor-pointer rounded-full border-[1.5px] px-3.5 py-1.5 text-[0.92rem] ${value === o.value ? 'border-accent bg-accent-soft font-medium text-accent' : 'border-line bg-surface'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Readout({ children }: { children: React.ReactNode }) {
  return <div className="mt-2.5 min-h-[2.6em] rounded-xl bg-surface-2 p-2.5 text-center text-[1.05rem]">{children}</div>;
}
