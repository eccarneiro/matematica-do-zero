'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { BRANCH_KINDS } from '@/content/branches';
import { RhizomeList } from './RhizomeMap';

// O React Flow só é carregado nesta página e só no navegador.
const RhizomeMap = dynamic(() => import('./RhizomeMap').then((m) => m.RhizomeMap), {
  ssr: false,
  loading: () => <div className="h-[calc(100dvh-230px)] min-h-[460px] animate-pulse rounded-2xl bg-surface-2" />,
});

export function MapClient() {
  const [view, setView] = useState<'mapa' | 'lista'>('mapa');
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[0.82rem] font-semibold text-ink-2" aria-label="Legenda">
          <li className="flex items-center gap-1.5"><span className="h-1.5 w-6 rounded-full bg-indigo" />tronco (caminho recomendado)</li>
          <li className="flex items-center gap-1.5"><span className="w-6 border-t-2 border-dashed border-ink-3" />conexão</li>
          {Object.values(BRANCH_KINDS).map((k) => <li key={k.label}>{k.icon} {k.label}</li>)}
        </ul>
        <div role="radiogroup" aria-label="Visualização" className="inline-flex gap-1 rounded-xl border border-line bg-surface-2 p-1">
          {(['mapa', 'lista'] as const).map((v) => (
            <button key={v} type="button" role="radio" aria-checked={view === v} onClick={() => setView(v)}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-[0.85rem] font-bold capitalize ${view === v ? 'bg-surface text-ink shadow-card' : 'text-ink-3'}`}>
              {v}
            </button>
          ))}
        </div>
      </div>
      {view === 'mapa' ? <RhizomeMap /> : <RhizomeList />}
    </>
  );
}
