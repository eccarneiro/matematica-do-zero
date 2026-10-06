import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Termos de uso' };

const CONTATO = 'emanuelcorreacarneiro@gmail.com';

export default function TermsPage() {
  return (
    <article className="prose card mx-auto max-w-[760px] p-6 sm:p-8">
      <h1 className="text-[2rem]">Termos de uso</h1>
      <p className="text-ink-3">Última atualização: outubro de 2026</p>

      <p>
        O <b>Matemática do Zero</b> é um curso livre e gratuito de matemática, oferecido como está, para fins
        educacionais. Ao usar o site, você concorda com estes termos.
      </p>

      <h3>Uso do curso</h3>
      <ul>
        <li>O acesso é gratuito e não exige cadastro. O login com Google é opcional e serve para guardar seu progresso.</li>
        <li>Use o site de forma pessoal e respeitosa; não tente prejudicar seu funcionamento.</li>
        <li>O conteúdo é revisado com cuidado, mas pode conter erros. Se encontrar algum, conte para a gente pelo botão de feedback.</li>
      </ul>

      <h3>Conteúdo de terceiros</h3>
      <p>
        As videoaulas são de seus respectivos canais no YouTube e seguem os termos do YouTube. Os créditos de
        cada vídeo aparecem junto a ele.
      </p>

      <h3>Mudanças</h3>
      <p>
        O curso está em construção e pode mudar: novas aulas, ajustes e melhorias. Estes termos podem ser
        atualizados, sempre com a data acima.
      </p>

      <h3>Contato</h3>
      <p>
        Dúvidas: <a href={`mailto:${CONTATO}`}>{CONTATO}</a>. Veja também a{' '}
        <a href="/privacidade">política de privacidade</a>.
      </p>
    </article>
  );
}
