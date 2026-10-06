'use client';

import { useMounted } from '@/lib/useMounted';
import { useGameStats } from '@/progress/useGameStats';

/** Boas-vindas para quem ainda não começou; some depois do primeiro XP. */
export function Welcome() {
  const { xp } = useGameStats();
  const mounted = useMounted();
  if (!mounted || xp > 0) return null;

  return (
    <div className="card mb-8 overflow-hidden">
      <div className="paper border-b-2 border-paper-line px-5 pt-5 pb-4">
        <p className="text-[0.72rem] font-extrabold tracking-[0.14em] text-paper-ink-2 uppercase">Curso gratuito · do básico ao cálculo</p>
        <h1 className="mt-1.5 text-[1.9rem] text-paper-ink">
          Matemática do zero, <em className="text-coral">com história e sentido.</em>
        </h1>
      </div>
      <div className="px-5 py-4 text-[0.98rem] text-ink-2">
        <p>
          Cada aula conta quem inventou a ideia e por quê, mostra com desenhos que você mexe e termina com
          <b className="text-ink"> treino infinito</b>. Siga a trilha: toque na primeira bolinha para começar.
        </p>
      </div>
    </div>
  );
}
