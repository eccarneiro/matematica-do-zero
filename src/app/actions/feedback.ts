'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/server/auth';
import { isAdmin } from '@/server/admin';
import { db, schema } from '@/server/db';

const feedbackInput = z.object({
  message: z.string().trim().min(3, 'Escreva pelo menos algumas palavras.').max(2000),
  rating: z.number().int().min(1).max(5).optional(),
  email: z.union([z.string().trim().email('E-mail inválido.').max(200), z.literal('')]).optional(),
  page: z.string().max(200).optional(),
  /** Campo-isca: invisível para pessoas, robôs costumam preencher. */
  website: z.string().max(0).optional(),
});

export type FeedbackResult = { ok: true } | { ok: false; error: string };

export async function submitFeedback(input: z.input<typeof feedbackInput>): Promise<FeedbackResult> {
  const parsed = feedbackInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' };
  if (!db) return { ok: false, error: 'O envio de feedback ainda não está disponível.' };

  const session = await auth();
  const { message, rating, email, page } = parsed.data;
  await db.insert(schema.feedback).values({
    userId: session?.user?.id ?? null,
    email: email || session?.user?.email || null,
    rating: rating ?? null,
    message,
    page: page ?? null,
  });
  return { ok: true };
}

/** Marca um feedback como lido/novo (só administradores). */
export async function setFeedbackStatus(id: number, status: 'novo' | 'lido'): Promise<void> {
  if (!db || !(await isAdmin())) return;
  await db.update(schema.feedback).set({ status }).where(eq(schema.feedback.id, id));
  revalidatePath('/admin');
}
