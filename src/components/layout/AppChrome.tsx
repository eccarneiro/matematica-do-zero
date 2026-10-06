'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconPractice, IconSearch, IconTrail, IconUser } from '@/components/ui/icons';
import { NAV_ITEMS } from './nav';
import { StatChips } from './GameStats';
import { ThemeToggle } from './ThemeToggle';

const ICONS = { trail: IconTrail, practice: IconPractice, search: IconSearch, user: IconUser } as const;

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-ink no-underline" aria-label="Matemática do Zero, página inicial">
      <span
        aria-hidden
        className="grid size-10 place-items-center rounded-2xl bg-coral font-serif text-[1.35rem] font-bold text-white shadow-[0_3px_0_var(--coral-shade)]"
      >
        0
      </span>
      {!compact && (
        <span className="font-serif text-[1.05rem] leading-none font-semibold whitespace-nowrap">
          Matemática <em className="text-coral">do Zero</em>
        </span>
      )}
    </Link>
  );
}

/** Menu lateral (computador). */
export function SideNav() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 flex-none flex-col gap-6 border-r-2 border-line px-4 py-6 md:flex lg:w-64">
      <div className="px-2"><Logo /></div>
      <nav aria-label="Principal" className="grid gap-1.5">
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = ICONS[item.icon];
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3.5 rounded-2xl border-2 px-3.5 py-2.5 text-[0.95rem] font-extrabold tracking-wide uppercase no-underline ${
                active ? 'c-blue border-accent bg-accent-soft text-accent' : 'border-transparent text-ink-2 hover:bg-surface-2'
              }`}
            >
              <Icon className="size-7" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-2"><ThemeToggle /></div>
    </aside>
  );
}

/** Barra de status no topo (celular). */
export function MobileTopBar() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b-2 border-line bg-bg/95 px-4 pt-[calc(8px+env(safe-area-inset-top))] pb-2 backdrop-blur md:hidden">
      <Logo compact />
      <StatChips />
    </header>
  );
}

/** Abas fixas embaixo (celular). */
export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegação"
      className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t-2 border-line bg-surface px-2 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom))] md:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const active = item.match(pathname);
        const Icon = ICONS[item.icon];
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            aria-label={item.label}
            className="flex flex-col items-center gap-0.5 py-1 text-[0.7rem] font-extrabold tracking-wide uppercase no-underline"
          >
            <span className={`grid h-9 w-14 place-items-center rounded-xl border-2 ${active ? 'c-blue border-accent bg-accent-soft text-accent' : 'border-transparent text-ink-3'}`}>
              <Icon className="size-6" />
            </span>
            <span className={active ? 'text-ink' : 'text-ink-3'}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
