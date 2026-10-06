import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ReviewPractice } from '@/components/practice/ReviewPractice';

export const metadata: Metadata = { title: 'Revisão' };

export default function ReviewPage() {
  // A lista de aulas vem na URL (?aulas=...), lida no navegador para a página continuar estática.
  return (
    <Suspense>
      <ReviewPractice />
    </Suspense>
  );
}
