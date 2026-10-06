import { describe, expect, it } from 'vitest';
import { computeAdminMetrics, type AdminInput } from './metrics';

const today = new Date(2026, 9, 6); // 6 de outubro de 2026

const input: AdminInput = {
  today,
  users: [
    { id: 'a', email: 'a@x.com', name: 'Ana', createdAt: new Date(2026, 8, 1) },
    { id: 'b', email: 'b@x.com', name: 'Bia', createdAt: new Date(2026, 9, 5) },
    { id: 'c', email: 'c@x.com', name: 'Caio', createdAt: new Date(2026, 9, 6) },
  ],
  days: [
    { userId: 'a', day: '2026-10-04', xp: 50 },
    { userId: 'a', day: '2026-10-05', xp: 40 },
    { userId: 'a', day: '2026-10-06', xp: 30 }, // Ana: 120 XP, sequência 3
    { userId: 'b', day: '2026-10-05', xp: 20 }, // Bia: 20 XP, sequência 1 (estudou ontem)
    { userId: 'a', day: '2026-08-01', xp: 0 },
  ],
  lessons: [
    { userId: 'a', lessonId: 'l1', done: true },
    { userId: 'a', lessonId: 'l2', done: true },
    { userId: 'b', lessonId: 'l1', done: true },
    { userId: 'b', lessonId: 'l2', done: false },
    { userId: 'b', lessonId: 'ramo-quipus', done: true },
  ],
  topics: [
    { userId: 'a', topicId: 't1', correct: 8, total: 10, level: 2 },
    { userId: 'b', topicId: 't1', correct: 1, total: 2, level: 1 },
  ],
  lessonOrder: [{ id: 'l1', title: 'Aula 1' }, { id: 'l2', title: 'Aula 2' }],
  topicNames: { t1: 'Tópico 1', t2: 'Tópico 2' },
};

describe('computeAdminMetrics', () => {
  const m = computeAdminMetrics(input);

  it('conta cadastrados, ativos e novos', () => {
    expect(m.totals).toMatchObject({ users: 3, activeToday: 1, active7: 2, active30: 2, new7: 2, xp: 140, lessonsDone: 3, branchesDone: 1, questions: 12 });
    expect(m.totals.accuracy).toBeCloseTo(9 / 12);
  });

  it('distribui os alunos por nível (inclusive quem tem 0 XP)', () => {
    // Ana 120 XP → nível 2; Bia 20 e Caio 0 → nível 1
    expect(m.levels.map((l) => l.users)).toEqual([2, 1]);
    expect(m.levels[1].title).toBe('Aprendiz de escriba');
  });

  it('monta o funil e os tópicos', () => {
    expect(m.funnel.map((f) => f.users)).toEqual([2, 1]);
    expect(m.topics[0]).toMatchObject({ id: 't1', questions: 12, students: 2, byLevel: [1, 1, 0] });
    expect(m.topics[1]).toMatchObject({ id: 't2', questions: 0, accuracy: null });
  });

  it('séries diárias de 30 dias terminando hoje', () => {
    expect(m.activeByDay).toHaveLength(30);
    expect(m.activeByDay.at(-1)).toEqual({ day: '2026-10-06', value: 1 });
    expect(m.activeByDay.at(-2)).toEqual({ day: '2026-10-05', value: 2 });
    expect(m.signupsByDay.at(-1)!.value).toBe(1);
  });

  it('agrupa sequências e lista alunos do mais novo para o mais antigo', () => {
    expect(m.streakBuckets.map((b) => b.users)).toEqual([1, 1, 1, 0]);
    expect(m.students.map((s) => s.name)).toEqual(['Caio', 'Bia', 'Ana']);
    expect(m.students[2]).toMatchObject({ xp: 120, level: 2, lessonsDone: 2, lastActive: '2026-10-06', streak: 3 });
  });
});
