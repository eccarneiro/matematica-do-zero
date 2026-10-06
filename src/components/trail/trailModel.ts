import type { CourseModule, LessonRef } from '@/content/types';
import type { Progress } from '@/progress/model';

export type NodeState = 'done' | 'current' | 'open' | 'soon';

export type TrailNode =
  | { kind: 'lesson'; lesson: LessonRef; state: NodeState }
  /** Estrela de revisão: treino misto com as aulas anteriores da unidade. */
  | { kind: 'review'; id: string; lessonIds: string[]; state: NodeState };

export interface TrailUnit {
  module: CourseModule;
  nodes: TrailNode[];
  done: number;
  ready: number;
}

/**
 * Revisões: com seções, uma no fim de cada seção (só com as micro-aulas dela).
 * Sem seções, uma a cada REVIEW_EVERY aulas e outra no fim da unidade (sem
 * revisão intermediária a menos de 2 aulas do fim, para não ficarem coladas).
 */
export const REVIEW_EVERY = 3;

/** Monta a trilha: estado de cada aula e posição das revisões. */
export function buildTrail(curriculum: CourseModule[], progress: Progress): TrailUnit[] {
  const isDone = (l: LessonRef) => !!progress.lessons[l.id]?.done;
  const current = curriculum.flatMap((m) => m.lessons).find((l) => l.ready && !isDone(l));

  return curriculum.map((module) => {
    const nodes: TrailNode[] = [];
    let seen: LessonRef[] = [];
    module.lessons.forEach((lesson, i) => {
      const state: NodeState = !lesson.ready ? 'soon' : isDone(lesson) ? 'done' : lesson === current ? 'current' : 'open';
      nodes.push({ kind: 'lesson', lesson, state });
      seen.push(lesson);
      const next = module.lessons[i + 1];
      const last = i === module.lessons.length - 1;
      const remaining = module.lessons.length - (i + 1);
      const sectionEnd = lesson.section ? next?.section !== lesson.section : false;
      const everyThree = !lesson.section && (i + 1) % REVIEW_EVERY === 0 && remaining >= 2;
      if (last || sectionEnd || everyThree) {
        // Com seções, a revisão é só da seção; sem seções, de tudo o que veio antes.
        const pool = lesson.section ? seen.filter((l) => l.section === lesson.section) : seen;
        const practiced = pool.filter((l) => l.ready && l.topic);
        const allDone = practiced.length > 0 && practiced.every(isDone);
        nodes.push({
          kind: 'review',
          id: `${module.id}-revisao-${nodes.length}`,
          lessonIds: practiced.map((l) => l.id),
          state: practiced.length < 2 ? 'soon' : allDone ? 'done' : 'open',
        });
        if (lesson.section) seen = [];
      }
    });
    const ready = module.lessons.filter((l) => l.ready);
    return { module, nodes, ready: ready.length, done: ready.filter(isDone).length };
  });
}
