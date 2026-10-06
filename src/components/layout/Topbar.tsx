'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from './nav';
import { ThemeToggle } from './ThemeToggle';

export function Topbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-bg/90 px-4 pt-[calc(10px+env(safe-area-inset-top))] pb-2.5 backdrop-blur-md">
      <Link href="/" className="mr-auto flex items-center gap-2.5 text-ink no-underline" aria-label="Matemática do Zero, página inicial">
        <span
          aria-hidden
          className="grid size-[34px] place-items-center rounded-full bg-coral font-serif text-[1.2rem] font-bold text-white shadow-[inset_0_-3px_0_rgb(0_0_0/0.12)]"
        >
          0
        </span>
        <span className="font-serif text-[1.05rem] font-semibold">
          Matemática <em className="text-coral">do Zero</em>
        </span>
      </Link>
      <nav aria-label="Principal" className="hidden gap-1 md:flex">
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`rounded-full px-3.5 py-2 no-underline hover:bg-surface-2 ${active ? 'bg-surface-2 font-medium text-ink' : 'text-ink-2'}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <ThemeToggle />
    </header>
  );
}
