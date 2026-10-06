'use client';

import { useEffect, useState } from 'react';
import { LESSON_SECTIONS } from './sections';


/** Índice das seções, fixo no topo, destacando a seção visível. */
export function SectionNav() {
  const [active, setActive] = useState<string>('historia');

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-40% 0px -55% 0px' },
    );
    LESSON_SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <nav
      aria-label="Seções da aula"
      className="sticky top-[61px] z-10 -mx-4 mt-2 flex gap-2 overflow-x-auto bg-bg px-4 pt-1.5 pb-2.5 [scrollbar-width:none]"
    >
      {LESSON_SECTIONS.map((s, i) => {
        const on = active === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            aria-current={on ? 'true' : undefined}
            className={`inline-flex flex-none items-center gap-1.5 rounded-full border bg-surface py-1.5 pr-3 pl-1.5 text-[0.85rem] no-underline ${on ? 'border-accent text-accent' : 'border-line text-ink-2'}`}
          >
            <span className={`grid size-[22px] place-items-center rounded-full text-[0.75rem] ${on ? 'bg-accent text-on-accent' : 'bg-surface-2'}`}>{i + 1}</span>
            {s.short}
          </a>
        );
      })}
    </nav>
  );
}
