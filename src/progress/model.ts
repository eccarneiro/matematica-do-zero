// Modelo do progresso do aluno, compartilhado entre navegador e servidor.

import type { Level } from '@/generators/types';

export interface LessonState {
  done: boolean;
  updatedAt: number;
}

export interface TopicStats {
  /** Acertos de primeira. */
  correct: number;
  /** Questões feitas. */
  total: number;
  /** Sequência atual de acertos de primeira. */
  streak: number;
  best: number;
  level: Level;
  /** Acertos seguidos no nível atual (sobe de nível ao chegar em LEVEL_UP_STREAK). */
  levelStreak: number;
  updatedAt: number;
}

export interface Progress {
  lessons: Record<string, LessonState>;
  topics: Record<string, TopicStats>;
}

export const LEVEL_UP_STREAK = 5;

export const emptyProgress = (): Progress => ({ lessons: {}, topics: {} });

export const emptyStats = (): TopicStats => ({
  correct: 0, total: 0, streak: 0, best: 0, level: 1, levelStreak: 0, updatedAt: 0,
});

function mergeByDate<T extends { updatedAt: number }>(a: Record<string, T>, b: Record<string, T>): Record<string, T> {
  const out = { ...a };
  for (const [key, value] of Object.entries(b)) {
    if (!out[key] || value.updatedAt > out[key].updatedAt) out[key] = value;
  }
  return out;
}

/** Junta dois progressos (ex.: deste aparelho e da nuvem). Em conflito, vence o mais recente. */
export function mergeProgress(a: Progress, b: Progress): Progress {
  return { lessons: mergeByDate(a.lessons, b.lessons), topics: mergeByDate(a.topics, b.topics) };
}

/** Aplica o resultado de uma questão às estatísticas do tópico. */
export function recordResult(prev: TopicStats, firstTry: boolean, now = Date.now()): { stats: TopicStats; leveledUp: boolean } {
  const s = { ...prev, total: prev.total + 1, updatedAt: now };
  let leveledUp = false;
  if (firstTry) {
    s.correct += 1;
    s.streak += 1;
    s.best = Math.max(s.best, s.streak);
    s.levelStreak += 1;
    if (s.levelStreak >= LEVEL_UP_STREAK && s.level < 3) {
      s.level = (s.level + 1) as Level;
      s.levelStreak = 0;
      leveledUp = true;
    }
  } else {
    s.streak = 0;
    s.levelStreak = 0;
  }
  return { stats: s, leveledUp };
}
