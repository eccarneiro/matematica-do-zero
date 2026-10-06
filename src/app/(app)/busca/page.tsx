import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchBox } from '@/components/search/SearchBox';

export const metadata: Metadata = { title: 'Buscar' };

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-[620px]">
      <h1 className="mb-5 text-[2rem]">Buscar assunto</h1>
      {/* useSearchParams exige Suspense para a página continuar estática */}
      <Suspense>
        <SearchBox />
      </Suspense>
    </div>
  );
}
