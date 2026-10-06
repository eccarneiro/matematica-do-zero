'use client';

import { DAILY_GOAL_XP, dayKey, dayStreak, playerLevel, recentDays, totalXp } from './model';
import { useProgress } from './store';

/** Números da gamificação: XP, nível, sequência, meta do dia, semana e acerto. */
export function useGameStats() {
  const progress = useProgress();
  const days = progress.days ?? {};
  const today = days[dayKey()] ?? 0;
  const xp = totalXp(progress);
  const totals = Object.values(progress.topics).reduce((a, t) => ({ c: a.c + t.correct, t: a.t + t.total }), { c: 0, t: 0 });
  return {
    xp,
    level: playerLevel(xp),
    today,
    streak: dayStreak(days),
    studiedToday: today > 0,
    goal: DAILY_GOAL_XP,
    goalDone: today >= DAILY_GOAL_XP,
    goalRatio: Math.min(1, today / DAILY_GOAL_XP),
    week: recentDays(days, 7),
    questions: totals.t,
    accuracy: totals.t ? totals.c / totals.t : null,
    lessonsDone: Object.values(progress.lessons).filter((l) => l.done).length,
  };
}
