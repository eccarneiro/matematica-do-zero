import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 md:px-8">
          <span className="grid size-9 place-items-center rounded-xl bg-indigo font-display text-lg font-bold text-white">0</span>
          <p className="font-display text-[1.1rem] font-bold">Matemática do Zero <span className="text-ink-3">· Admin</span></p>
          <Link href="/" className="btn btn-ghost ml-auto min-h-10 px-4 py-2 text-[0.9rem]">Ver o site</Link>
        </div>
      </header>
      <main id="conteudo" className="mx-auto max-w-[1400px] px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
