import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { curriculum, getModule } from '@/content/curriculum';
import { ModuleCard } from '@/components/trail/ModuleCard';

export const dynamicParams = false;

export function generateStaticParams() {
  return curriculum.map((m) => ({ moduleId: m.id }));
}

export async function generateMetadata({ params }: PageProps<'/modulo/[moduleId]'>): Promise<Metadata> {
  const courseModule = getModule((await params).moduleId);
  return { title: courseModule?.title };
}

export default async function ModulePage({ params }: PageProps<'/modulo/[moduleId]'>) {
  const courseModule = getModule((await params).moduleId);
  if (!courseModule) notFound();
  return (
    <>
      <nav className="mb-3.5 text-sm text-ink-3">
        <Link href="/" className="text-ink-2 no-underline">Trilha</Link> › <span>Módulo {courseModule.number}</span>
      </nav>
      <ModuleCard module={courseModule} asPage />
    </>
  );
}
