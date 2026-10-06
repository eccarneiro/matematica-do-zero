import { SideNav, MobileTopBar, TabBar } from '@/components/layout/AppChrome';
import { StatCards } from '@/components/layout/GameStats';

/** Moldura do app: menu lateral + conteúdo + estatísticas (computador); topo + abas (celular). */
export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-dvh">
      <SideNav />
      <div className="min-w-0 flex-1">
        <MobileTopBar />
        <div className="mx-auto flex max-w-[1060px] gap-10 px-4 pt-5 pb-[calc(96px+env(safe-area-inset-bottom))] md:px-8 md:pt-8 md:pb-12">
          <main id="conteudo" className="min-w-0 flex-1">
            {children}
          </main>
          <aside className="sticky top-8 hidden h-fit w-[300px] flex-none lg:block">
            <StatCards />
          </aside>
        </div>
      </div>
      <TabBar />
    </div>
  );
}
