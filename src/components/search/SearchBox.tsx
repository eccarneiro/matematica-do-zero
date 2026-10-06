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
        className="w-full rounded-full border-2 border-line bg-surface px-[18px] py-3.5 text-[1.1rem] font-normal text-ink outline-none focus:border-coral"
      />
      <ul className="mt-4 grid gap-2" aria-live="polite">
        {results.length === 0 && <li className="text-ink-2">Nada encontrado. Tente outra palavra.</li>}
        {results.map(({ module, lesson }) => {
          const body = (
            <>
              <span className="text-[0.72rem] font-semibold tracking-[0.08em] text-accent uppercase">{module.title}</span>
              <span className="flex-1">{lesson.title}</span>
              {!lesson.ready && <span className="badge">em breve</span>}
            </>
          );
          const cls = `c-${module.color} flex flex-wrap items-center gap-2.5 rounded-xl border border-line bg-surface px-4 py-3.5`;
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
