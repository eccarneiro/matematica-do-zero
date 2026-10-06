'use client';

import { useState } from 'react';
import { tallySvg } from '@/generators/naturais';
import { Interactive, Readout, Slider } from './Interactive';

/** Contagem por riscos: uma marca por coisa, agrupadas de 5 em 5. */
export function Riscos() {
  const [n, setN] = useState(12);
  const groups = Math.floor(n / 5);
  return (
    <Interactive title="Contar com riscos" hint="O quinto risco corta os outros quatro: assim fica fácil contar de 5 em 5.">
      <div className="mx-auto max-w-[360px] [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: n ? tallySvg(n) : '<p class="text-center text-ink-3 py-6">Nenhum risco.</p>' }} />
      <div className="mt-3"><Slider label="Coisas contadas" value={n} min={0} max={30} onChange={setN} /></div>
      <Readout>
        <p className="font-bold">{n} {n === 1 ? 'risco' : 'riscos'} = {groups} {groups === 1 ? 'feixe' : 'feixes'} de 5 + {n % 5}</p>
        <p className="mt-1 text-[0.9rem] text-ink-2">{n === 0 ? 'Sem nada para contar, não há o que riscar: contar começa no 1.' : 'Cada risco corresponde a uma coisa contada.'}</p>
      </Readout>
    </Interactive>
  );
}
