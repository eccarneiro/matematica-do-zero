import { describe, expect, it } from 'vitest';
import { emptyStats, mergeProgress, recordResult, LEVEL_UP_STREAK, type Progress, type TopicStats } from './model';

describe('recordResult', () => {
  it('sobe de nível após acertos seguidos de primeira', () => {
    let s = emptyStats();
    let leveled = false;
    for (let i = 0; i < LEVEL_UP_STREAK; i++) ({ stats: s, leveledUp: leveled } = recordResult(s, true, i));
    expect(leveled).toBe(true);
    expect(s).toMatchObject({ level: 2, levelStreak: 0, streak: LEVEL_UP_STREAK, correct: LEVEL_UP_STREAK, total: LEVEL_UP_STREAK });
  });

  it('um erro zera as sequências mas conta a questão', () => {
    const { stats } = recordResult({ ...emptyStats(), streak: 3, levelStreak: 3, best: 3 }, false);
    expect(stats).toMatchObject({ streak: 0, levelStreak: 0, best: 3, total: 1, correct: 0 });
  });

  it('não passa do nível 3', () => {
    let s: TopicStats = { ...emptyStats(), level: 3 };
    for (let i = 0; i < 10; i++) s = recordResult(s, true).stats;
    expect(s.level).toBe(3);
  });
});

describe('mergeProgress', () => {
  it('fica com o registro mais recente de cada aula e tópico', () => {
    const local: Progress = {
      lessons: { a: { done: true, updatedAt: 5 }, b: { done: true, updatedAt: 1 } },
      topics: { inteiros: { ...emptyStats(), total: 10, updatedAt: 9 } },
    };
    const cloud: Progress = {
      lessons: { b: { done: false, updatedAt: 2 }, c: { done: true, updatedAt: 3 } },
      topics: { inteiros: { ...emptyStats(), total: 4, updatedAt: 7 } },
    };
    const merged = mergeProgress(local, cloud);
    expect(merged.lessons).toEqual({ a: local.lessons.a, b: cloud.lessons.b, c: cloud.lessons.c });
    expect(merged.topics.inteiros.total).toBe(10);
  });
});
