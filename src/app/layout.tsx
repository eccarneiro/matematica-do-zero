import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Newsreader, Plus_Jakarta_Sans } from 'next/font/google';
import { Providers } from '@/components/layout/Providers';
import { authEnabled } from '@/server/auth';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-jakarta', display: 'swap' });
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--font-bricolage', display: 'swap' });
const newsreader = Newsreader({ subsets: ['latin'], weight: ['400', '500', '600'], style: ['normal', 'italic'], variable: '--font-newsreader', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Matemática do Zero', template: '%s · Matemática do Zero' },
  description: 'Curso gratuito de matemática do zero ao cálculo, com história, interativos e treino infinito.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f7fb' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1220' },
  ],
  viewportFit: 'cover',
};

// Aplica o tema antes da primeira pintura: escolha salva ou preferência do sistema.
const themeScript = `(function(){try{var t=localStorage.getItem('mdz:theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={`${jakarta.variable} ${bricolage.variable} ${newsreader.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2">
          Pular para o conteúdo
        </a>
        <Providers authEnabled={authEnabled}>{children}</Providers>
      </body>
    </html>
  );
}
