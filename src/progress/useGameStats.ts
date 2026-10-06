'use client';

import { DAILY_GOAL_XP, dayKey, dayStreak, totalXp } from './model';
import { useProgress } from './store';

/** Números da gamificação: XP total, XP de hoje, sequência de dias e meta diária. */
export function useGameStats() {
  const progress = useProgress();
  const today = progress.days?.[dayKey()] ?? 0;
  return {
    xp: totalXp(progress),
    today,
    streak: dayStreak(progress.days ?? {}),
    studiedToday: today > 0,
    goal: DAILY_GOAL_XP,
    goalDone: today >= DAILY_GOAL_XP,
    goalRatio: Math.min(1, today / DAILY_GOAL_XP),
  };
}
