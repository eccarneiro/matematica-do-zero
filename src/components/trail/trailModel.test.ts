import { describe, expect, it } from 'vitest';
import type { CourseModule } from '@/content/types';
import { emptyProgress, type Progress } from '@/progress/model';
import { buildTrail } from './trailModel';

const lesson = (id: string, ready = true) => ({ id, title: id, symbol: id, year: '1', place: 'x', keywords: '', ready, topic: ready ? ('inteiros' as const) : undefined });
const mod = (id: string, lessons: ReturnType<typeof lesson>[]): CourseModule => ({
  id, number: 1, title: id, tagline: '', eras: '', color: 'coral', lessons,
});

const course = [mod('m1', [lesson('a'), lesson('b'), lesson('c'), lesson('d'), lesson('e')]), mod('m2', [lesson('x', false)])];
const done = (...ids: string[]): Progress => ({
  ...emptyProgress(),
  lessons: Object.fromEntries(ids.map((id) => [id, { done: true, updatedAt: 1 }])),
});

describe('buildTrail', () => {
  it('marca a primeira aula não concluída como atual', () => {
    const [m1] = buildTrail(course, done('a'));
    const states = m1.nodes.filter((n) => n.kind === 'lesson').map((n) => n.state);
    expect(states).toEqual(['done', 'current', 'open', 'open', 'open']);
    expect(m1.done).toBe(1);
    expect(m1.ready).toBe(5);
  });

  it('põe revisão a cada 3 aulas e no fim da unidade', () => {
    const [m1] = buildTrail(course, emptyProgress());
    expect(m1.nodes.map((n) => n.kind)).toEqual(['lesson', 'lesson', 'lesson', 'review', 'lesson', 'lesson', 'review']);
    const reviews = m1.nodes.filter((n) => n.kind === 'review');
    expect(reviews.map((r) => r.kind === 'review' && r.lessonIds)).toEqual([['a', 'b', 'c'], ['a', 'b', 'c', 'd', 'e']]);
  });

  it('não cola duas revisões perto do fim', () => {
    const four = [mod('m', [lesson('a'), lesson('b'), lesson('c'), lesson('d')])];
    expect(buildTrail(four, emptyProgress())[0].nodes.map((n) => n.kind)).toEqual(['lesson', 'lesson', 'lesson', 'lesson', 'review']);
  });

  it('revisão fica concluída quando todas as aulas anteriores estão', () => {
    const [m1] = buildTrail(course, done('a', 'b', 'c'));
    const review = m1.nodes[3];
    expect(review.state).toBe('done');
  });

  it('unidade sem aulas publicadas fica toda "em breve"', () => {
    const [, m2] = buildTrail(course, emptyProgress());
    expect(m2.nodes.every((n) => n.state === 'soon')).toBe(true);
  });
});
