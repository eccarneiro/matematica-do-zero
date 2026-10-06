/** Modo foco (aula e treino): tela cheia, sem menus. */
export default function FocusLayout({ children }: LayoutProps<'/'>) {
  return <main id="conteudo" className="min-h-dvh">{children}</main>;
}
