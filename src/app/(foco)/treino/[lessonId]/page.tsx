import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { curriculum, findLesson } from '@/content/curriculum';
import { Practice } from '@/components/practice/Practice';

export const dynamicParams = false;

export function generateStaticParams() {
  return curriculum.flatMap((m) => m.lessons.filter((l) => l.topic).map((l) => ({ lessonId: l.id })));
}

export async function generateMetadata({ params }: PageProps<'/treino/[lessonId]'>): Promise<Metadata> {
  const found = findLesson((await params).lessonId);
  return { title: found ? `Treino: ${found.lesson.title}` : undefined };
}

export default async function TopicPracticePage({ params }: PageProps<'/treino/[lessonId]'>) {
  const found = findLesson((await params).lessonId);
  if (!found?.lesson.topic) notFound();
  const { module: mod, lesson } = found;
  return (
    <div className={`c-${mod.color}`}>
      <nav className="mb-3.5 text-sm text-ink-3">
        <Link href="/treino" className="text-ink-2 no-underline">Treino</Link> ›{' '}
        {lesson.ready ? <Link href={`/aula/${lesson.id}`} className="text-ink-2 no-underline">{lesson.title}</Link> : lesson.title}
      </nav>
      <h1 className="mb-4 text-[clamp(1.6rem,5vw,2.2rem)]">Treino: {lesson.title}</h1>
      <Practice topics={[{ topic: lesson.topic!, title: lesson.title }]} />
    </div>
  );
}
