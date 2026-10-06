'use client';

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

  // Os dois ícones são renderizados; o CSS mostra o certo (evita divergência na hidratação).
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Alternar modo claro/escuro"
      className="grid size-10 cursor-pointer place-items-center rounded-full border border-line bg-surface"
    >
      <svg viewBox="0 0 24 24" aria-hidden className="size-5 fill-none stroke-ink stroke-[1.8] dark:hidden" strokeLinecap="round">
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
      </svg>
      <svg viewBox="0 0 24 24" aria-hidden className="hidden size-5 fill-none stroke-ink stroke-[1.8] dark:block" strokeLinecap="round">
        <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
      </svg>
    </button>
  );
}
