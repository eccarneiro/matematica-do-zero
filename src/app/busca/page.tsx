import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchBox } from '@/components/search/SearchBox';

export const metadata: Metadata = { title: 'Buscar' };

export default function SearchPage() {
  return (
    <>
      <h1 className="mb-4 text-[clamp(1.6rem,5vw,2.2rem)]">Buscar assunto</h1>
      {/* useSearchParams exige Suspense para a página continuar estática */}
      <Suspense>
        <SearchBox />
      </Suspense>
    </>
  );
}
