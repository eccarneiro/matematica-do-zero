'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { curriculum } from '@/content/curriculum';

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const ENTRIES = curriculum.flatMap((module) =>
  module.lessons.map((lesson) => ({
    module,
    lesson,
    haystack: normalize(`${lesson.title} ${lesson.keywords} ${lesson.summary ?? ''} ${module.title}`),
  })),
);

export function SearchBox() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(params.get('q') ?? '');

  const results = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    return terms.length ? ENTRIES.filter((e) => terms.every((t) => e.haystack.includes(t))) : ENTRIES;
  }, [query]);

  function onChange(value: string) {
    setQuery(value);
    router.replace(value ? `${pathname}?q=${encodeURIComponent(value)}` : pathname, { scroll: false });
  }

  return (
    <>
      <input
        type="search"
        autoFocus
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ex.: frações, Pitágoras, derivada…"
        aria-label="Buscar assunto"
        autoComplete="off"
        className="w-full rounded-2xl border-2 border-line bg-surface px-5 py-4 text-[1.15rem] font-bold text-ink shadow-card outline-none placeholder:text-ink-3 focus:border-indigo"
      />
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-live="polite">
        {results.length === 0 && <li className="text-ink-2">Nada encontrado. Tente outra palavra.</li>}
        {results.map(({ module, lesson }) => {
          const body = (
            <>
              <span className={`grid size-12 flex-none place-items-center rounded-full font-display text-[1.15rem] font-bold ${lesson.ready ? 'bg-accent text-on-accent' : 'bg-surface-2 text-ink-3'}`}>{lesson.symbol}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.7rem] font-extrabold tracking-[0.12em] text-accent uppercase">{module.title}</span>
                <span className="block font-extrabold">{lesson.title}</span>
              </span>
              {!lesson.ready && <span className="badge">em breve</span>}
            </>
          );
          const cls = `c-${module.color} card flex items-center gap-3.5 px-4 py-3`;
          return (
            <li key={lesson.id}>
              {lesson.ready ? (
                <Link href={`/aula/${lesson.id}`} className={`${cls} text-ink no-underline`}>{body}</Link>
              ) : (
                <div className={`${cls} text-ink-3`}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
