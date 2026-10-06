'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from './nav';

const ICONS: Record<string, React.ReactNode> = {
  '/': (
    <>
      <path d="M4 19c4 0 4-6 8-6s4-6 8-6" />
      <circle cx="4" cy="19" r="2" />
      <circle cx="20" cy="7" r="2" />
    </>
  ),
  '/treino': (
    <>
      <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" />
      <path d="M18 3v4h-4M6 21v-4h4" />
    </>
  ),
  '/busca': (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
};

/** Navegação fixa no rodapé, só no celular. */
export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegação rápida"
      className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-line bg-surface/90 px-2 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`flex flex-col items-center gap-0.5 rounded-xl p-1.5 text-xs no-underline ${active ? 'font-medium text-coral' : 'text-ink-2'}`}
          >
            <svg viewBox="0 0 24 24" aria-hidden className="size-6 fill-none stroke-current stroke-[1.8]" strokeLinecap="round" strokeLinejoin="round">
              {ICONS[item.href]}
            </svg>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
