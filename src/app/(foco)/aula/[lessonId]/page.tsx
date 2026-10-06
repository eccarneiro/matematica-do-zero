import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { curriculum, findLesson } from '@/content/curriculum';
import { getLessonContent } from '@/content/lessons';
import { LessonPlayer } from '@/components/lesson/LessonPlayer';
import { ExamplesStep, HistoryStep, IdeaStep, ThinkStep, UsesStep, VideosStep } from '@/components/lesson/Steps';

export const dynamicParams = false;

export function generateStaticParams() {
  return curriculum.flatMap((m) => m.lessons.filter((l) => l.ready).map((l) => ({ lessonId: l.id })));
}

export async function generateMetadata({ params }: PageProps<'/aula/[lessonId]'>): Promise<Metadata> {
  const found = findLesson((await params).lessonId);
  return found ? { title: found.lesson.title, description: found.lesson.summary } : {};
}

export default async function LessonPage({ params }: PageProps<'/aula/[lessonId]'>) {
  const found = findLesson((await params).lessonId);
  const content = found && (await getLessonContent(found.lesson.id));
  if (!found || !content) notFound();

  const { module: mod, lesson, index } = found;
  const { meta, History, Idea } = content;
  const next = mod.lessons[index + 1];

  return (
    <div className={`c-${mod.color}`}>
      <LessonPlayer
        lessonId={lesson.id}
        title={lesson.title}
        topic={lesson.topic ? { topic: lesson.topic, title: lesson.title } : undefined}
        nextLesson={next?.ready ? { id: next.id, title: next.title } : undefined}
        steps={[
          { id: 'historia', label: '1 · A história', content: <HistoryStep meta={meta} History={History} /> },
          { id: 'ideia', label: '2 · A ideia', content: <IdeaStep Idea={Idea} /> },
          { id: 'uso', label: '3 · Pra que serve hoje', content: <UsesStep meta={meta} /> },
          { id: 'pensar', label: '4 · Pra pensar', content: <ThinkStep meta={meta} /> },
          { id: 'videos', label: '5 · Videoaulas', content: <VideosStep meta={meta} /> },
          { id: 'exemplos', label: '6 · Exemplos resolvidos', content: <ExamplesStep meta={meta} /> },
          { id: 'treino', label: '7 · Treino' },
        ]}
      />
    </div>
  );
}
