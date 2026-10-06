'use client';

import { progressStore } from '@/progress/store';

export function SiteFooter() {
  function reset() {
    if (confirm('Apagar todo o seu progresso neste aparelho (aulas concluídas e placar)?')) progressStore.reset();
  }
  return (
    <footer className="mx-auto max-w-[820px] border-t border-line px-4 pt-6 pb-8 text-sm text-ink-3">
      <p>Matemática do Zero — curso livre e gratuito, do básico ao cálculo.</p>
      <button type="button" onClick={reset} className="mt-1 cursor-pointer underline">
        Apagar meu progresso neste aparelho
      </button>
    </footer>
  );
}
