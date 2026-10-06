import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { curriculum, findLesson } from '@/content/curriculum';
import { getLessonContent } from '@/content/lessons';
import { MathText } from '@/components/MathText';
import { Practice } from '@/components/practice/Practice';
import { SectionNav } from '@/components/lesson/SectionNav';
import { LESSON_SECTIONS } from '@/components/lesson/sections';
import { VideoEmbed } from '@/components/lesson/VideoEmbed';
import { WorkedExample } from '@/components/lesson/WorkedExample';
import { DoneButton } from '@/components/lesson/DoneButton';

export const dynamicParams = false;

export function generateStaticParams() {
  return curriculum.flatMap((m) => m.lessons.filter((l) => l.ready).map((l) => ({ lessonId: l.id })));
}

export async function generateMetadata({ params }: PageProps<'/aula/[lessonId]'>): Promise<Metadata> {
  const found = findLesson((await params).lessonId);
  return found ? { title: found.lesson.title, description: found.lesson.summary } : {};
}

function SectionTitle({ n, id }: { n: number; id: string }) {
  return <p className="eyebrow">{n} · {LESSON_SECTIONS.find((s) => s.id === id)!.long}</p>;
}

export default async function LessonPage({ params }: PageProps<'/aula/[lessonId]'>) {
  const found = findLesson((await params).lessonId);
  const content = found && (await getLessonContent(found.lesson.id));
  if (!found || !content) notFound();

  const { module: mod, lesson, index } = found;
  const { meta, History, Idea } = content;
  const prev = mod.lessons[index - 1];
  const next = mod.lessons[index + 1];
  const section = 'scroll-mt-28 border-t border-line pt-8 mt-5';

  return (
    <article className={`c-${mod.color}`}>
      <header className="pt-1">
        <nav className="mb-3.5 text-sm text-ink-3">
          <Link href="/" className="text-ink-2 no-underline">Trilha</Link> ›{' '}
          <Link href={`/modulo/${mod.id}`} className="text-ink-2 no-underline">{mod.title}</Link> › <span>Aula {index + 1}</span>
        </nav>
        <h1 className="mb-2 text-[clamp(1.9rem,6vw,2.6rem)]">{lesson.title}</h1>
        {lesson.summary && <p className="text-[1.08rem] text-ink-2">{lesson.summary}</p>}
      </header>
      <SectionNav />

      <section
        id="historia"
        className="card mt-5 scroll-mt-28 bg-[radial-gradient(circle_at_100%_0,var(--accent-soft),transparent_55%)] px-[18px] pt-6 pb-3"
      >
        <SectionTitle n={1} id="historia" />
        <h2 className="mb-2 text-[clamp(1.45rem,4.5vw,1.9rem)] italic">{meta.history.title}</h2>
        <div className="mb-4 flex flex-wrap gap-x-3.5 gap-y-1.5 text-[0.86rem] text-ink-2">
          <span>🕰️ {meta.history.when}</span>
          <span>📍 {meta.history.where}</span>
          {meta.history.who && <span>👤 {meta.history.who}</span>}
        </div>
        <div className="prose prose-history">
          <History />
        </div>
      </section>

      <section id="ideia" className={section}>
        <SectionTitle n={2} id="ideia" />
        <div className="prose">
          <Idea />
        </div>
      </section>

      <section id="uso" className={section}>
        <SectionTitle n={3} id="uso" />
        <div className="grid gap-3 sm:grid-cols-2">
          {meta.uses.map((u) => (
            <div key={u.title} className="rounded-xl border border-line bg-surface p-4">
              <span aria-hidden className="mb-1.5 block text-[1.6rem]">{u.icon}</span>
              <h3 className="mb-1 font-sans text-base font-semibold">{u.title}</h3>
              <MathText as="p" text={u.text} className="text-[0.93rem] text-ink-2" />
            </div>
          ))}
        </div>
      </section>

      <section id="pensar" className={section}>
        <SectionTitle n={4} id="pensar" />
        <blockquote className="relative overflow-hidden rounded-[18px] bg-ink px-5 py-6 text-bg">
          <span aria-hidden className="absolute -top-10 -right-1.5 font-serif text-[11rem] leading-none text-accent opacity-25">?</span>
          <MathText as="p" text={meta.think.question} className="relative mb-3 font-serif text-[1.35rem] leading-snug font-semibold italic" />
          <MathText as="p" text={meta.think.text} className="relative text-[0.95rem] opacity-85" />
        </blockquote>
      </section>

      <section id="videos" className={section}>
        <SectionTitle n={5} id="videos" />
        <div className="grid gap-[18px] sm:grid-cols-2">
          {meta.videos.map((v) => (
            <VideoEmbed key={v.id} video={v} />
          ))}
        </div>
      </section>

      <section id="exemplos" className={section}>
        <SectionTitle n={6} id="exemplos" />
        <div className="grid gap-4">
          {meta.examples.map((ex, i) => (
            <WorkedExample key={i} n={i + 1} example={ex} />
          ))}
        </div>
      </section>

      <section id="treino" className={section}>
        <SectionTitle n={7} id="treino" />
        <p className="mb-3 text-ink-2">
          Questões novas a cada clique. Acerte 5 seguidas de primeira para subir de nível.{' '}
          <Link href={`/treino/${lesson.id}`}>Abrir em tela cheia ›</Link>
        </p>
        {lesson.topic && <Practice topics={[{ topic: lesson.topic, title: lesson.title }]} compact />}
      </section>

      <footer className="mt-9 grid justify-items-center gap-[18px] border-t border-line pt-6">
        <DoneButton lessonId={lesson.id} />
        <div className="flex w-full justify-between gap-3 text-[0.92rem]">
          {prev ? <Link href={`/aula/${prev.id}`} className="max-w-[48%] text-ink-2 no-underline">‹ {prev.title}</Link> : <span />}
          {next?.ready && <Link href={`/aula/${next.id}`} className="ml-auto max-w-[48%] text-right text-ink-2 no-underline">{next.title} ›</Link>}
        </div>
      </footer>
    </article>
  );
}
