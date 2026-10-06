import type { Metadata, Viewport } from 'next';
import { Fraunces, Lexend } from 'next/font/google';
import { Topbar } from '@/components/layout/Topbar';
import { TabBar } from '@/components/layout/TabBar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import './globals.css';

const lexend = Lexend({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-lexend', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], weight: ['500', '600', '700'], style: ['normal', 'italic'], variable: '--font-fraunces', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Matemática do Zero', template: '%s · Matemática do Zero' },
  description: 'Curso gratuito de matemática do zero ao cálculo, com história, interativos e treino infinito.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbf7f1' },
    { media: '(prefers-color-scheme: dark)', color: '#14161c' },
  ],
  viewportFit: 'cover',
};

// Aplica o tema antes da primeira pintura: escolha salva ou preferência do sistema.
const themeScript = `(function(){try{var t=localStorage.getItem('mdz:theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={`${lexend.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="pb-[calc(72px+env(safe-area-inset-bottom))] md:pb-0">
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2">
          Pular para o conteúdo
        </a>
        <Topbar />
        <main id="conteudo" className="mx-auto max-w-[820px] px-4 pt-5 pb-10">
          {children}
        </main>
        <SiteFooter />
        <TabBar />
      </body>
    </html>
  );
}
