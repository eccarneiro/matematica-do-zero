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
  /** XP ganho por dia (chave AAAA-MM-DD no fuso do aluno). */
  days: Record<string, number>;
}

export const LEVEL_UP_STREAK = 5;
/** Acertos de primeira necessários no treino para concluir uma aula. */
export const LESSON_GOAL = 5;
export const DAILY_GOAL_XP = 50;
export const XP = { firstTry: 10, secondTry: 5, lessonDone: 20 } as const;

export const emptyProgress = (): Progress => ({ lessons: {}, topics: {}, days: {} });

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

function mergeDays(a: Record<string, number>, b: Record<string, number>): Record<string, number> {
  const out = { ...a };
  for (const [day, xp] of Object.entries(b)) out[day] = Math.max(out[day] ?? 0, xp);
  return out;
}

/**
 * Junta dois progressos (ex.: deste aparelho e da nuvem). Em aulas e tópicos
 * vence o registro mais recente; no XP de cada dia, o maior valor.
 */
export function mergeProgress(a: Progress, b: Progress): Progress {
  return {
    lessons: mergeByDate(a.lessons, b.lessons),
    topics: mergeByDate(a.topics, b.topics),
    days: mergeDays(a.days ?? {}, b.days ?? {}),
  };
}

/** Data local no formato AAAA-MM-DD. */
export function dayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const totalXp = (p: Progress) => Object.values(p.days ?? {}).reduce((s, x) => s + x, 0);

/**
 * Dias seguidos com algum XP, terminando hoje (ou ontem, se hoje ainda não
 * houve estudo: a sequência só se perde quando um dia inteiro passa em branco).
 */
export function dayStreak(days: Record<string, number>, today = new Date()): number {
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!(days[dayKey(cursor)] > 0)) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days[dayKey(cursor)] > 0) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function addXp(days: Record<string, number>, xp: number, today = new Date()): Record<string, number> {
  const key = dayKey(today);
  return { ...days, [key]: (days[key] ?? 0) + xp };
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

/** Títulos do nível do aluno, inspirados na própria história do curso. */
export const LEVEL_TITLES = [
  'Contador de pedrinhas',
  'Aprendiz de escriba',
  'Escriba',
  'Calculista',
  'Mestre do ábaco',
  'Guardião do zero',
  'Algebrista',
  'Geômetra',
  'Astrônomo',
  'Analista',
  'Sábio de Alexandria',
] as const;

/** XP total necessário para chegar ao nível n (n ≥ 1): 0, 60, 180, 360, 600… */
export const xpForLevel = (n: number) => 30 * n * (n - 1);

/** Nível do aluno a partir do XP total, com o progresso até o próximo. */
export function playerLevel(xp: number) {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  const from = xpForLevel(level);
  const to = xpForLevel(level + 1);
  return {
    level,
    title: LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length) - 1],
    into: xp - from,
    needed: to - from,
    ratio: (xp - from) / (to - from),
  };
}

/** XP de cada um dos últimos `n` dias (do mais antigo para hoje). */
export function recentDays(days: Record<string, number>, n = 7, today = new Date()) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (n - 1 - i));
    return { key: dayKey(d), date: d, xp: days[dayKey(d)] ?? 0 };
  });
}
