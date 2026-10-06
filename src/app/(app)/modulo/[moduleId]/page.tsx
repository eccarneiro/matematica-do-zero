import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { curriculum, getModule } from '@/content/curriculum';
import { ModuleGuide } from '@/components/trail/ModuleGuide';

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
    <div className="mx-auto max-w-[620px]">
      <Link href="/" className="mb-4 inline-block text-[0.85rem] font-extrabold tracking-wide text-ink-3 uppercase no-underline">‹ Trilha</Link>
      <ModuleGuide module={courseModule} />
    </div>
  );
}
