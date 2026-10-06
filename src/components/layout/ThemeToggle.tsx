'use client';

import { IconMoon, IconSun } from '@/components/ui/icons';

export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem('mdz:theme', next);
    } catch {
      // sem armazenamento: vale só nesta visita
    }
  }

  // Os dois rótulos são renderizados; o CSS mostra o certo (evita divergência na hidratação).
  return (
    <button type="button" onClick={toggle} className="btn btn-ghost w-full justify-start normal-case" aria-label="Alternar modo claro/escuro">
      <span className="flex items-center gap-2.5 dark:hidden"><IconMoon className="size-5" /> Modo escuro</span>
      <span className="hidden items-center gap-2.5 dark:flex"><IconSun className="size-5" /> Modo claro</span>
    </button>
  );
}
