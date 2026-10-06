import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { curriculum, findLesson } from '@/content/curriculum';
import { PracticeScreen } from '@/components/practice/PracticeScreen';

export const dynamicParams = false;

export function generateStaticParams() {
  return curriculum.flatMap((m) => m.lessons.filter((l) => l.ready && l.topic).map((l) => ({ lessonId: l.id })));
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
      <PracticeScreen topics={[{ topic: lesson.topic!, title: lesson.title }]} title={lesson.title} />
    </div>
  );
}
