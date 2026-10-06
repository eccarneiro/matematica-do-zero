// Métricas do painel de administração, calculadas a partir das linhas do banco.
// Funções puras (sem acesso ao banco) para poderem ser testadas.

import { dayKey, dayStreak, playerLevel, LEVEL_TITLES } from '@/progress/model';

export interface UserRow { id: string; email: string | null; name: string | null; createdAt: Date }
export interface DayRow { userId: string; day: string; xp: number }
export interface LessonRow { userId: string; lessonId: string; done: boolean }
export interface TopicRow { userId: string; topicId: string; correct: number; total: number; level: number }

export interface AdminInput {
  users: UserRow[];
  days: DayRow[];
  lessons: LessonRow[];
  topics: TopicRow[];
  /** Ordem das aulas publicadas (para o funil). */
  lessonOrder: { id: string; title: string }[];
  topicNames: Record<string, string>;
  today?: Date;
}

const shift = (today: Date, delta: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + delta);

export function computeAdminMetrics(input: AdminInput) {
  const today = input.today ?? new Date();
  const todayKey = dayKey(today);
  const since = (n: number) => dayKey(shift(today, -(n - 1)));

  // XP e dias por aluno
  const daysByUser = new Map<string, Record<string, number>>();
  for (const d of input.days) {
    const m = daysByUser.get(d.userId) ?? {};
    m[d.day] = (m[d.day] ?? 0) + d.xp;
    daysByUser.set(d.userId, m);
  }
  const xpOf = (id: string) => Object.values(daysByUser.get(id) ?? {}).reduce((s, x) => s + x, 0);
  const lastDayOf = (id: string) => Object.keys(daysByUser.get(id) ?? {}).sort().at(-1) ?? null;

  const activeSince = (n: number) => {
    const from = since(n);
    return new Set(input.days.filter((d) => d.xp > 0 && d.day >= from && d.day <= todayKey).map((d) => d.userId)).size;
  };

  // Séries diárias dos últimos 30 dias
  const last30 = Array.from({ length: 30 }, (_, i) => dayKey(shift(today, i - 29)));
  const activeByDay = last30.map((day) => ({
    day,
    value: new Set(input.days.filter((d) => d.day === day && d.xp > 0).map((d) => d.userId)).size,
  }));
  const signupsByDay = last30.map((day) => ({
    day,
    value: input.users.filter((u) => dayKey(u.createdAt) === day).length,
  }));

  // Distribuição por nível (todos os cadastrados, inclusive quem tem 0 XP)
  const levelCounts = new Map<number, number>();
  for (const u of input.users) {
    const { level } = playerLevel(xpOf(u.id));
    levelCounts.set(level, (levelCounts.get(level) ?? 0) + 1);
  }
  const maxLevel = Math.max(1, ...levelCounts.keys());
  const levels = Array.from({ length: maxLevel }, (_, i) => ({
    level: i + 1,
    title: LEVEL_TITLES[Math.min(i + 1, LEVEL_TITLES.length) - 1],
    users: levelCounts.get(i + 1) ?? 0,
  }));

  // Funil das aulas
  const doneByLesson = new Map<string, number>();
  for (const l of input.lessons) if (l.done) doneByLesson.set(l.lessonId, (doneByLesson.get(l.lessonId) ?? 0) + 1);
  const funnel = input.lessonOrder.map((l) => ({ ...l, users: doneByLesson.get(l.id) ?? 0 }));

  // Tópicos: questões, acerto de primeira e alunos por nível do treino
  const topicAgg = new Map<string, { questions: number; correct: number; students: number; byLevel: [number, number, number] }>();
  for (const t of input.topics) {
    const a = topicAgg.get(t.topicId) ?? { questions: 0, correct: 0, students: 0, byLevel: [0, 0, 0] };
    a.questions += t.total;
    a.correct += t.correct;
    a.students += 1;
    a.byLevel[Math.min(3, Math.max(1, t.level)) - 1] += 1;
    topicAgg.set(t.topicId, a);
  }
  const topics = Object.entries(input.topicNames).map(([id, title]) => {
    const a = topicAgg.get(id) ?? { questions: 0, correct: 0, students: 0, byLevel: [0, 0, 0] as [number, number, number] };
    return { id, title, ...a, accuracy: a.questions ? a.correct / a.questions : null };
  });

  // Sequências de dias
  const streakBuckets = [
    { label: 'Sem sequência', min: 0, max: 0, users: 0 },
    { label: '1–2 dias', min: 1, max: 2, users: 0 },
    { label: '3–6 dias', min: 3, max: 6, users: 0 },
    { label: '7+ dias', min: 7, max: Infinity, users: 0 },
  ];
  for (const u of input.users) {
    const s = dayStreak(daysByUser.get(u.id) ?? {}, today);
    streakBuckets.find((b) => s >= b.min && s <= b.max)!.users += 1;
  }

  // Alunos (mais recentes primeiro)
  const lessonsDone = new Map<string, number>();
  for (const l of input.lessons) if (l.done) lessonsDone.set(l.userId, (lessonsDone.get(l.userId) ?? 0) + 1);
  const students = [...input.users]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((u) => {
      const xp = xpOf(u.id);
      const lvl = playerLevel(xp);
      return { ...u, xp, level: lvl.level, title: lvl.title, lessonsDone: lessonsDone.get(u.id) ?? 0, lastActive: lastDayOf(u.id), streak: dayStreak(daysByUser.get(u.id) ?? {}, today) };
    });

  const totalQuestions = input.topics.reduce((s, t) => s + t.total, 0);
  const totalCorrect = input.topics.reduce((s, t) => s + t.correct, 0);

  return {
    totals: {
      users: input.users.length,
      activeToday: activeSince(1),
      active7: activeSince(7),
      active30: activeSince(30),
      new7: input.users.filter((u) => dayKey(u.createdAt) >= since(7)).length,
      questions: totalQuestions,
      accuracy: totalQuestions ? totalCorrect / totalQuestions : null,
      lessonsDone: [...doneByLesson.values()].reduce((s, x) => s + x, 0),
      xp: input.days.reduce((s, d) => s + d.xp, 0),
    },
    activeByDay,
    signupsByDay,
    levels,
    funnel,
    topics,
    streakBuckets,
    students,
  };
}

export type AdminMetrics = ReturnType<typeof computeAdminMetrics>;
