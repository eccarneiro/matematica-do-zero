import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchBox } from '@/components/search/SearchBox';

export const metadata: Metadata = { title: 'Buscar' };

export default function SearchPage() {
  return (
    <div className="max-w-[1100px]">
      <h1 className="mb-5 text-[clamp(2rem,4vw,2.6rem)]">Buscar assunto</h1>
      {/* useSearchParams exige Suspense para a página continuar estática */}
      <Suspense>
        <SearchBox />
      </Suspense>
    </div>
  );
}
