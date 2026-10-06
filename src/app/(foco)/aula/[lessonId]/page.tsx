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

  // Etapas opcionais só entram quando a micro-aula tem conteúdo para elas.
  const parts: { id: string; name: string; content?: React.ReactNode }[] = [
    { id: 'historia', name: 'A história', content: <HistoryStep meta={meta} History={History} /> },
    { id: 'ideia', name: 'A ideia', content: <IdeaStep Idea={Idea} /> },
    ...(meta.uses?.length ? [{ id: 'uso', name: 'Pra que serve hoje', content: <UsesStep uses={meta.uses} /> }] : []),
    ...(meta.think ? [{ id: 'pensar', name: 'Pra pensar', content: <ThinkStep think={meta.think} /> }] : []),
    ...(meta.videos?.length ? [{ id: 'videos', name: 'Videoaulas', content: <VideosStep videos={meta.videos} /> }] : []),
    { id: 'exemplos', name: 'Exemplos resolvidos', content: <ExamplesStep meta={meta} /> },
    ...(lesson.topic ? [{ id: 'treino', name: 'Treino' }] : []),
  ];
  const steps = parts.map((p, i) => ({ id: p.id, label: `${i + 1} · ${p.name}`, content: p.content }));

  return (
    <div className={`c-${mod.color}`}>
      <LessonPlayer
        lessonId={lesson.id}
        title={lesson.title}
        stop={{ symbol: lesson.symbol, year: lesson.year, place: lesson.place, title: lesson.title }}
        topic={lesson.topic ? { topic: lesson.topic, title: lesson.title, kinds: lesson.kinds } : undefined}
        nextLesson={next?.ready ? { id: next.id, title: next.title } : undefined}
        steps={steps}
      />
    </div>
  );
}
