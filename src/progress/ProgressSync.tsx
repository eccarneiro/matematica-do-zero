'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { syncProgress } from '@/app/actions/progress';
import { emptyProgress, type Progress } from './model';
import { progressStore } from './store';

const DEBOUNCE_MS = 1500;

/**
 * Com o aluno logado: ao entrar, envia o progresso deste aparelho e recebe o
 * da nuvem; depois envia cada mudança (agrupadas a cada 1,5 s).
 */
export function ProgressSync() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== 'authenticated') return;
    let alive = true;
    const pending = { lessons: new Set<string>(), topics: new Set<string>(), days: false };
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function send(payload: Progress) {
      try {
        const cloud = await syncProgress(payload);
        if (alive && cloud) progressStore.merge(cloud);
      } catch (err) {
        console.warn('Não foi possível sincronizar o progresso agora.', err);
      }
    }

    function flush() {
      clearTimeout(timer);
      if (!pending.lessons.size && !pending.topics.size && !pending.days) return;
      const all = progressStore.get();
      const payload = emptyProgress();
      pending.lessons.forEach((id) => { if (all.lessons[id]) payload.lessons[id] = all.lessons[id]; });
      pending.topics.forEach((id) => { if (all.topics[id]) payload.topics[id] = all.topics[id]; });
      if (pending.days) payload.days = all.days;
      pending.lessons.clear();
      pending.topics.clear();
      pending.days = false;
      void send(payload);
    }

    // Entrada: junta tudo o que já existe neste aparelho com a nuvem.
    void send(progressStore.get());

    const off = progressStore.onChange((change) => {
      if (change.kind === 'day') pending.days = true;
      else (change.kind === 'lesson' ? pending.lessons : pending.topics).add(change.id);
      clearTimeout(timer);
      timer = setTimeout(flush, DEBOUNCE_MS);
    });
    const onHide = () => { if (document.visibilityState === 'hidden') flush(); };
    document.addEventListener('visibilitychange', onHide);

    return () => {
      alive = false;
      flush();
      off();
      document.removeEventListener('visibilitychange', onHide);
    };
  }, [status]);

  return null;
}
