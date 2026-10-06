'use server';

import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/server/auth';
import { db, schema } from '@/server/db';
import type { Progress } from '@/progress/model';

// Server Actions são endpoints públicos: valida tudo o que chega.
const id = z.string().regex(/^[a-z0-9-]{1,64}$/);
const ms = z.number().int().nonnegative();
const count = z.number().int().min(0).max(10_000_000);

const progressInput = z.object({
  lessons: z.record(id, z.object({ done: z.boolean(), updatedAt: ms })),
  topics: z.record(
    id,
    z.object({
      correct: count, total: count, streak: count, best: count,
      level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      levelStreak: count, updatedAt: ms,
    }),
  ),
  days: z.record(z.string().regex(/^\d{4}-\d{2}-\d{2}$/), count).optional(),
});

/**
 * Envia mudanças deste aparelho e devolve o progresso completo da nuvem.
 * Em cada aula/tópico, só grava se a mudança for mais recente que a salva.
 */
export async function syncProgress(input: Progress): Promise<Progress | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || !db) return null;

  const data = progressInput.parse(input);
  const lessons = Object.entries(data.lessons).map(([lessonId, l]) => ({ userId, lessonId, ...l }));
  const topics = Object.entries(data.topics).map(([topicId, t]) => ({ userId, topicId, ...t }));
  const days = Object.entries(data.days ?? {}).map(([day, xp]) => ({ userId, day, xp }));

  if (lessons.length) {
    const t = schema.lessonProgress;
    await db.insert(t).values(lessons).onConflictDoUpdate({
      target: [t.userId, t.lessonId],
      set: { done: sql`excluded.done`, updatedAt: sql`excluded.updated_at` },
      setWhere: sql`excluded.updated_at > ${t.updatedAt}`,
    });
  }
  if (topics.length) {
    const t = schema.topicStats;
    await db.insert(t).values(topics).onConflictDoUpdate({
      target: [t.userId, t.topicId],
      set: {
        correct: sql`excluded.correct`, total: sql`excluded.total`, streak: sql`excluded.streak`,
        best: sql`excluded.best`, level: sql`excluded.level`, levelStreak: sql`excluded.level_streak`,
        updatedAt: sql`excluded.updated_at`,
      },
      setWhere: sql`excluded.updated_at > ${t.updatedAt}`,
    });
  }

  if (days.length) {
    const t = schema.dailyXp;
    await db.insert(t).values(days).onConflictDoUpdate({
      target: [t.userId, t.day],
      set: { xp: sql`greatest(${t.xp}, excluded.xp)` },
    });
  }

  const [lessonRows, topicRows, dayRows] = await Promise.all([
    db.select().from(schema.lessonProgress).where(eq(schema.lessonProgress.userId, userId)),
    db.select().from(schema.topicStats).where(eq(schema.topicStats.userId, userId)),
    db.select().from(schema.dailyXp).where(eq(schema.dailyXp.userId, userId)),
  ]);

  return {
    lessons: Object.fromEntries(lessonRows.map((r) => [r.lessonId, { done: r.done, updatedAt: r.updatedAt }])),
    topics: Object.fromEntries(
      topicRows.map((r) => [
        r.topicId,
        { correct: r.correct, total: r.total, streak: r.streak, best: r.best, level: r.level as 1 | 2 | 3, levelStreak: r.levelStreak, updatedAt: r.updatedAt },
      ]),
    ),
    days: Object.fromEntries(dayRows.map((r) => [r.day, r.xp])),
  };
}
