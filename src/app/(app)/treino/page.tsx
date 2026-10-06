import type { Metadata } from 'next';
import { practiceLessons } from '@/content/curriculum';
import { PracticeHub } from '@/components/practice/PracticeHub';

export const metadata: Metadata = { title: 'Treino' };

export default function PracticeHubPage() {
  const lessons = practiceLessons().map(({ module: mod, lesson }) => ({
    id: lesson.id,
    title: lesson.title,
    symbol: lesson.symbol,
    topic: lesson.topic,
    kinds: lesson.kinds,
    section: lesson.section,
    color: mod.color,
  }));
  return (
    <div>
      <h1 className="mb-1 text-[clamp(2rem,4vw,2.6rem)]">Treino</h1>
      <p className="mb-6 text-ink-2">Questões novas a cada vez, sem fim. Acertos de primeira valem 10 XP.</p>
      <PracticeHub lessons={lessons} />
    </div>
  );
}
