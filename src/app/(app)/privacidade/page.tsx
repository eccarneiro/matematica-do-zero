import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Política de privacidade' };

const CONTATO = 'emanuelcorreacarneiro@gmail.com';

export default function PrivacyPage() {
  return (
    <article className="prose card mx-auto max-w-[760px] p-6 sm:p-8">
      <h1 className="text-[2rem]">Política de privacidade</h1>
      <p className="text-ink-3">Última atualização: outubro de 2026</p>

      <p>
        O <b>Matemática do Zero</b> é um curso gratuito de matemática. Coletamos o mínimo de dados
        necessário para o site funcionar e nunca vendemos ou compartilhamos seus dados para publicidade.
      </p>

      <h3>Sem login</h3>
      <p>
        Você pode usar o curso inteiro sem entrar. Nesse caso, seu progresso (aulas concluídas, placar,
        XP e nível) fica salvo apenas no seu navegador, no próprio aparelho.
      </p>

      <h3>Com login pelo Google</h3>
      <p>Se você entrar com sua conta Google, guardamos:</p>
      <ul>
        <li>seu <b>nome</b>, <b>e-mail</b> e <b>foto de perfil</b>, fornecidos pelo Google;</li>
        <li>seu <b>progresso no curso</b>: aulas concluídas, desempenho no treino e XP por dia.</li>
      </ul>
      <p>
        Usamos esses dados apenas para sincronizar seu progresso entre aparelhos e para entender, de forma
        agregada, como o curso está sendo usado (por exemplo, quantas pessoas concluíram cada aula).
        Não pedimos acesso a nenhum outro dado da sua conta Google.
      </p>

      <h3>Feedback</h3>
      <p>
        Quando você envia um feedback, guardamos a mensagem, a nota, a página de onde ela veio e, se você
        informar, seu e-mail para resposta.
      </p>

      <h3>Estatísticas de visitas</h3>
      <p>
        Usamos o Vercel Web Analytics para contar visitas de forma anônima, sem cookies e sem identificar
        você individualmente.
      </p>

      <h3>Onde os dados ficam</h3>
      <p>
        O site é hospedado pela Vercel e o banco de dados pela Neon, com servidores no Brasil (São Paulo).
        Os vídeos das aulas são do YouTube e só carregam quando você toca neles.
      </p>

      <h3>Seus direitos (LGPD)</h3>
      <p>
        Você pode pedir a qualquer momento acesso, correção ou exclusão dos seus dados. Basta escrever para{' '}
        <a href={`mailto:${CONTATO}`}>{CONTATO}</a>. O progresso salvo só no aparelho pode ser apagado na
        página Perfil.
      </p>
    </article>
  );
}
