import { describe, expect, it } from 'vitest';
import { addXp, dayKey, dayStreak, emptyStats, mergeProgress, playerLevel, recentDays, recordResult, totalXp, LEVEL_UP_STREAK, type Progress, type TopicStats } from './model';

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
      days: { '2026-10-01': 30, '2026-10-02': 10 },
    };
    const cloud: Progress = {
      lessons: { b: { done: false, updatedAt: 2 }, c: { done: true, updatedAt: 3 } },
      topics: { inteiros: { ...emptyStats(), total: 4, updatedAt: 7 } },
      days: { '2026-10-02': 40, '2026-10-03': 5 },
    };
    const merged = mergeProgress(local, cloud);
    expect(merged.lessons).toEqual({ a: local.lessons.a, b: cloud.lessons.b, c: cloud.lessons.c });
    expect(merged.topics.inteiros.total).toBe(10);
    expect(merged.days).toEqual({ '2026-10-01': 30, '2026-10-02': 40, '2026-10-03': 5 });
    expect(totalXp(merged)).toBe(75);
  });

  it('é idempotente: juntar de novo não duplica XP', () => {
    const p: Progress = { lessons: {}, topics: {}, days: { '2026-10-01': 30 } };
    expect(mergeProgress(p, p).days['2026-10-01']).toBe(30);
  });
});

describe('sequência de dias', () => {
  const today = new Date(2026, 9, 6); // 6 de outubro
  it('conta dias seguidos até hoje', () => {
    expect(dayStreak({ '2026-10-04': 10, '2026-10-05': 5, '2026-10-06': 20 }, today)).toBe(3);
  });
  it('não perde a sequência se hoje ainda não estudou', () => {
    expect(dayStreak({ '2026-10-04': 10, '2026-10-05': 5 }, today)).toBe(2);
  });
  it('zera quando um dia passa em branco', () => {
    expect(dayStreak({ '2026-10-03': 10, '2026-10-04': 5 }, today)).toBe(0);
  });
  it('soma XP no dia local', () => {
    expect(dayKey(today)).toBe('2026-10-06');
    expect(addXp({ '2026-10-06': 10 }, 5, today)).toEqual({ '2026-10-06': 15 });
  });
});

describe('nível do aluno', () => {
  it('começa no nível 1 e sobe com o XP', () => {
    expect(playerLevel(0)).toMatchObject({ level: 1, title: 'Contador de pedrinhas', into: 0, needed: 60 });
    expect(playerLevel(59).level).toBe(1);
    expect(playerLevel(60)).toMatchObject({ level: 2, into: 0, needed: 120 });
    expect(playerLevel(200)).toMatchObject({ level: 3, into: 20, needed: 180 });
  });
  it('mantém o último título nos níveis muito altos', () => {
    expect(playerLevel(1_000_000).title).toBe('Sábio de Alexandria');
  });
});

describe('últimos dias', () => {
  it('lista os 7 dias até hoje com o XP de cada um', () => {
    const week = recentDays({ '2026-10-06': 20, '2026-10-01': 5 }, 7, new Date(2026, 9, 6));
    expect(week.map((d) => d.key)).toEqual(['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06']);
    expect(week.map((d) => d.xp)).toEqual([0, 5, 0, 0, 0, 0, 20]);
  });
});
