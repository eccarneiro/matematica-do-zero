'use client';

import { useOptimistic, useState, useTransition } from 'react';
import { setFeedbackStatus } from '@/app/actions/feedback';

export interface FeedbackItem {
  id: number;
  message: string;
  rating: number | null;
  email: string | null;
  page: string | null;
  status: string;
  createdAt: Date;
  userName: string | null;
}

const FACE = ['', '😞', '🙁', '😐', '🙂', '🤩'];

export function FeedbackList({ items }: { items: FeedbackItem[] }) {
  const [filter, setFilter] = useState<'novo' | 'todos'>('novo');
  const [list, setOptimistic] = useOptimistic(items, (state, { id, status }: { id: number; status: string }) =>
    state.map((f) => (f.id === id ? { ...f, status } : f)),
  );
  const [, startTransition] = useTransition();
  const shown = filter === 'novo' ? list.filter((f) => f.status === 'novo') : list;

  function toggle(f: FeedbackItem) {
    const status = f.status === 'novo' ? 'lido' : 'novo';
    startTransition(async () => {
      setOptimistic({ id: f.id, status });
      await setFeedbackStatus(f.id, status);
    });
  }

  return (
    <div>
      <div role="radiogroup" aria-label="Filtro" className="mb-4 inline-flex gap-1 rounded-xl border border-line bg-surface-2 p-1">
        {(['novo', 'todos'] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={filter === v}
            onClick={() => setFilter(v)}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-[0.85rem] font-bold ${filter === v ? 'bg-surface text-ink shadow-card' : 'text-ink-3'}`}
          >
            {v === 'novo' ? `Novos (${list.filter((f) => f.status === 'novo').length})` : `Todos (${list.length})`}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="rounded-xl border border-dashed border-edge px-4 py-8 text-center text-ink-3">
          {filter === 'novo' ? 'Nenhum feedback novo. 🎉' : 'Ainda não chegou nenhum feedback.'}
        </p>
      ) : (
        <ul className="grid gap-3">
          {shown.map((f) => (
            <li key={f.id} className={`rounded-xl border p-4 ${f.status === 'novo' ? 'border-accent/40 bg-accent-soft/40' : 'border-line'}`}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8rem] font-semibold text-ink-3">
                {f.rating && <span className="text-[1.2rem]" title={`Nota ${f.rating}/5`}>{FACE[f.rating]}</span>}
                <span className="text-ink-2">{f.userName ?? 'Visitante'}</span>
                {f.email && <a href={`mailto:${f.email}`}>{f.email}</a>}
                {f.page && <span>· {f.page}</span>}
                <span className="ml-auto">{new Date(f.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap">{f.message}</p>
              <button type="button" onClick={() => toggle(f)} className="mt-3 cursor-pointer text-[0.85rem] font-bold text-accent">
                {f.status === 'novo' ? 'Marcar como lido' : 'Marcar como novo'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
