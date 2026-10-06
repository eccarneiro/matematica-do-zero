import type { Metadata } from 'next';
import { practiceLessons } from '@/content/curriculum';
import { PracticeHub } from '@/components/practice/PracticeHub';

export const metadata: Metadata = { title: 'Treino' };

export default function PracticeHubPage() {
  const lessons = practiceLessons().map(({ module: mod, lesson }) => ({
    id: lesson.id,
    title: lesson.title,
    topic: lesson.topic,
    color: mod.color,
  }));
  return (
    <>
      <h1 className="mb-3 text-[clamp(1.6rem,5vw,2.2rem)]">Treino</h1>
      <p className="mb-2 max-w-[60ch] text-[1.05rem] text-ink-2">
        Escolha um tópico para treinar, ou misture vários para revisar. No treino misto, cada questão sorteia o
        tópico e usa o nível que você já alcançou nele.
      </p>
      <PracticeHub lessons={lessons} />
    </>
  );
}
