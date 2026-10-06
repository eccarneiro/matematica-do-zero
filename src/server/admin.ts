import 'server-only';
import { desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { curriculum } from '@/content/curriculum';
import { computeAdminMetrics } from '@/lib/admin/metrics';
import { auth } from './auth';
import { db, schema } from './db';

/** E-mails com acesso ao painel (variável ADMIN_EMAILS, separados por vírgula). */
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
}

/**
 * Libera o painel só para administradores. Para todos os outros (inclusive
 * quem não está logado) a página simplesmente "não existe".
 * Em desenvolvimento, ADMIN_DEV_BYPASS=1 libera sem login para testes locais.
 */
export async function requireAdmin(): Promise<{ email: string }> {
  if (process.env.NODE_ENV === 'development' && process.env.ADMIN_DEV_BYPASS === '1') return { email: 'dev@local' };
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email || !adminEmails().includes(email)) notFound();
  return { email };
}

export async function isAdmin(): Promise<boolean> {
  if (process.env.NODE_ENV === 'development' && process.env.ADMIN_DEV_BYPASS === '1') return true;
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  return !!email && adminEmails().includes(email);
}

/** Lê tudo o que o painel precisa. Simples de propósito: serve bem até alguns milhares de alunos. */
export async function loadAdminData() {
  if (!db) return null;
  const [users, days, lessons, topics, feedback] = await Promise.all([
    db.select({ id: schema.users.id, email: schema.users.email, name: schema.users.name, createdAt: schema.users.createdAt }).from(schema.users),
    db.select().from(schema.dailyXp),
    db.select({ userId: schema.lessonProgress.userId, lessonId: schema.lessonProgress.lessonId, done: schema.lessonProgress.done }).from(schema.lessonProgress),
    db.select({ userId: schema.topicStats.userId, topicId: schema.topicStats.topicId, correct: schema.topicStats.correct, total: schema.topicStats.total, level: schema.topicStats.level }).from(schema.topicStats),
    db.select().from(schema.feedback).orderBy(desc(schema.feedback.createdAt)).limit(200),
  ]);

  const published = curriculum.flatMap((m) => m.lessons.filter((l) => l.ready));
  const metrics = computeAdminMetrics({
    users,
    days,
    lessons,
    topics,
    lessonOrder: published.map((l) => ({ id: l.id, title: l.title })),
    topicNames: Object.fromEntries(published.filter((l) => l.topic).map((l) => [l.topic!, l.title])),
  });

  const names = new Map(users.map((u) => [u.id, u.name ?? u.email ?? u.id]));
  return {
    metrics,
    feedback: feedback.map((f) => ({ ...f, userName: f.userId ? names.get(f.userId) ?? null : null })),
  };
}
