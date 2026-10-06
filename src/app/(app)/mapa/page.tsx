import type { Metadata } from 'next';
import { MapClient } from '@/components/map/MapClient';

export const metadata: Metadata = { title: 'Mapa' };

export default function MapPage() {
  return (
    <div>
      <h1 className="text-[clamp(2rem,4vw,2.6rem)]">Mapa</h1>
      <p className="mb-5 max-w-[70ch] text-ink-2">
        Toda a matemática do curso como uma rede: o tronco é o caminho recomendado, e de cada parada saem
        ramos para aprofundar, conhecer outras culturas, pensar e se desafiar. Explore livremente.
      </p>
      <MapClient />
    </div>
  );
}
