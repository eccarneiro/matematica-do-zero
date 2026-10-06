import { SideNav, MobileTopBar, TabBar } from '@/components/layout/AppChrome';

/** Moldura do app: menu lateral (computador) ou topo + abas (celular). O conteúdo usa a largura toda. */
export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-dvh">
      <SideNav />
      <div className="min-w-0 flex-1">
        <MobileTopBar />
        <main id="conteudo" className="mx-auto max-w-[1480px] px-4 pt-5 pb-[calc(110px+env(safe-area-inset-bottom))] sm:px-6 md:px-10 md:pt-8 md:pb-14">
          {children}
        </main>
      </div>
      <TabBar />
    </div>
  );
}
