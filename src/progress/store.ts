'use client';

// Progresso no navegador: localStorage + assinatura para componentes React.
// Quando o aluno está logado, o módulo sync.ts envia as mudanças para a nuvem.

import { useSyncExternalStore } from 'react';
import type { Level } from '@/generators/types';
import { addXp, emptyProgress, emptyStats, mergeProgress, recordResult, XP, type Progress, type TopicStats } from './model';

const KEY = 'mdz:progress:v1';
const SERVER_SNAPSHOT = emptyProgress();

type Change = { kind: 'lesson'; id: string } | { kind: 'topic'; id: string } | { kind: 'day'; id: string };
type Listener = () => void;

let state: Progress | null = null;
const listeners = new Set<Listener>();
const changeListeners = new Set<(c: Change) => void>();

function read(): Progress {
  if (state) return state;
  try {
    const raw = localStorage.getItem(KEY);
    state = raw ? { ...emptyProgress(), ...JSON.parse(raw) } : emptyProgress();
    state!.days ??= {};
  } catch {
    state = emptyProgress();
  }
  return state!;
}

function write(next: Progress, change?: Change) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // modo privado ou armazenamento cheio: segue só em memória
  }
  listeners.forEach((l) => l());
  if (change) changeListeners.forEach((l) => l(change));
}

export const progressStore = {
  get: read,
  subscribe(l: Listener) {
    listeners.add(l);
    // Mantém abas abertas em sincronia.
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        state = null;
        l();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(l);
      window.removeEventListener('storage', onStorage);
    };
  },
  /** Avisado a cada mudança feita pelo aluno (usado para enviar à nuvem). */
  onChange(l: (c: Change) => void) {
    changeListeners.add(l);
    return () => changeListeners.delete(l);
  },

  /** Marca a aula; a primeira conclusão vale XP. Devolve o XP ganho. */
  setLessonDone(id: string, done: boolean): number {
    const p = read();
    const xp = done && !p.lessons[id]?.done ? XP.lessonDone : 0;
    write(
      { ...p, lessons: { ...p.lessons, [id]: { done, updatedAt: Date.now() } }, days: xp ? addXp(p.days, xp) : p.days },
      { kind: 'lesson', id },
    );
    if (xp) changeListeners.forEach((l) => l({ kind: 'day', id: '' }));
    return xp;
  },

  topic(id: string): TopicStats {
    return read().topics[id] ?? emptyStats();
  },

  /** Registra uma questão: 'first' (acertou de primeira), 'retry' (acertou depois da dica) ou 'miss'. */
  recordResult(id: string, outcome: 'first' | 'retry' | 'miss') {
    const p = read();
    const { stats, leveledUp } = recordResult(p.topics[id] ?? emptyStats(), outcome === 'first');
    const xp = outcome === 'first' ? XP.firstTry : outcome === 'retry' ? XP.secondTry : 0;
    write({ ...p, topics: { ...p.topics, [id]: stats }, days: xp ? addXp(p.days, xp) : p.days }, { kind: 'topic', id });
    if (xp) changeListeners.forEach((l) => l({ kind: 'day', id: '' }));
    return { stats, leveledUp, xp };
  },

  setLevel(id: string, level: Level) {
    const p = read();
    const prev = p.topics[id] ?? emptyStats();
    write({ ...p, topics: { ...p.topics, [id]: { ...prev, level, levelStreak: 0, updatedAt: Date.now() } } }, { kind: 'topic', id });
  },

  /** Junta com o progresso vindo da nuvem (sem disparar envio de volta). */
  merge(remote: Progress) {
    write(mergeProgress(read(), remote));
  },

  reset() {
    write(emptyProgress());
  },
};

export function useProgress(): Progress {
  return useSyncExternalStore(progressStore.subscribe, progressStore.get, () => SERVER_SNAPSHOT);
}
