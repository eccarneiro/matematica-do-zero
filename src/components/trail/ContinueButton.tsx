'use client';

import Link from 'next/link';
import { curriculum } from '@/content/curriculum';
import { useProgress } from '@/progress/store';

/** Leva à próxima aula publicada que o aluno ainda não concluiu. */
export function ContinueButton() {
  const progress = useProgress();
  const ready = curriculum.flatMap((m) => m.lessons.filter((l) => l.ready));
  if (!ready.length) return null;
  const next = ready.find((l) => !progress.lessons[l.id]?.done);
  if (!next) return <span className="pill">Você concluiu todas as aulas disponíveis!</span>;
  const started = ready.some((l) => progress.lessons[l.id]?.done);
  return (
    <Link href={`/aula/${next.id}`} className="btn btn-primary">
      {started ? 'Continuar' : 'Começar'}: {next.title}
    </Link>
  );
}
