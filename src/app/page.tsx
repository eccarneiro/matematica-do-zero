import Link from 'next/link';
import { curriculum } from '@/content/curriculum';
import { ModuleCard } from '@/components/trail/ModuleCard';
import { ContinueButton } from '@/components/trail/ContinueButton';

export default function HomePage() {
  return (
    <>
      <section className="c-coral pt-4 pb-8">
        <p className="eyebrow">Curso gratuito · do básico ao cálculo</p>
        <h1 className="mb-4 text-[clamp(1.9rem,6vw,2.8rem)]">
          Matemática do zero,
          <br />
          <em className="font-medium text-coral">com história e sentido.</em>
        </h1>
        <p className="mb-5 max-w-[60ch] text-[1.08rem] text-ink-2">
          Cada aula conta quem inventou a ideia e por quê, explica com desenhos que você mexe, mostra pra que serve
          hoje e termina com treino infinito: questões novas sempre que você quiser.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <ContinueButton />
          <Link href="/treino" className="btn btn-ghost">Treino misto</Link>
        </div>
      </section>

      <section aria-label="Trilha de módulos" className="grid gap-[18px]">
        {curriculum.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </section>
    </>
  );
}
