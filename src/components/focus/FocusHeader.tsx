import Link from 'next/link';
import { IconClose } from '@/components/ui/icons';

/** Topo do modo foco: fechar + barra de progresso + algo à direita. */
export function FocusHeader({
  closeHref = '/',
  progress,
  right,
  wide = false,
}: {
  /** Ocupa a largura do conteúdo em duas colunas (computador). */
  wide?: boolean;
  closeHref?: string;
  /** 0 a 1 */
  progress?: number;
  right?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 bg-bg/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className={`mx-auto flex items-center gap-4 px-4 py-3 ${wide ? 'max-w-[1320px] lg:px-8' : 'max-w-[680px]'}`}>
        <Link href={closeHref} aria-label="Sair" className="grid size-10 flex-none place-items-center rounded-xl text-ink-3 hover:bg-surface-2">
          <IconClose className="size-7" />
        </Link>
        {progress !== undefined && (
          <div className="h-4 flex-1 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
            <div className="relative h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${Math.max(progress * 100, 4)}%` }}>
              <span className="absolute inset-x-2 top-[3px] h-[3px] rounded-full bg-white/35" />
            </div>
          </div>
        )}
        {right}
      </div>
    </header>
  );
}
