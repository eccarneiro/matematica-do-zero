import type { LessonMeta } from '@/content/types';

const meta: LessonMeta = {
  history: { title: 'Varetas vermelhas e pretas', when: 'séc. II a.C. – séc. I d.C.; comentário de 263', where: 'China', who: 'Os Nove Capítulos; Liu Hui' },
  uses: [
    { icon: '🌡️', title: 'Temperatura', text: 'Termômetros vão abaixo de zero: \\(-4\\,^\\circ\\text{C}\\) é mais frio que \\(2\\,^\\circ\\text{C}\\).' },
    { icon: '🛗', title: 'Andares e altitudes', text: 'Elevador com subsolo (\\(-1, -2\\)) e o fundo do mar, abaixo do nível do mar.' },
    { icon: '⚽', title: 'Saldo de gols', text: 'Fez 20 gols e sofreu 27? Saldo \\(-7\\). A tabela ordena os times por esses inteiros.' },
  ],
  think: {
    question: 'Números negativos existem de verdade?',
    text: 'Ninguém nunca viu \\(-3\\) maçãs. Mesmo assim, os negativos descrevem perfeitamente dívidas, temperaturas e direções. Eles são uma descoberta sobre o mundo ou uma invenção útil?',
  },
  videos: [{ id: 'QpxmeCSGAlM', title: 'Introdução aos números negativos', channel: 'Khan Academy Brasil' }],
  examples: [
    {
      problem: 'Qual é maior: \\(-12\\) ou \\(-5\\)?',
      steps: [
        'Na reta, \\(-12\\) fica 12 casas à esquerda do zero e \\(-5\\) fica 5 casas à esquerda.',
        'Quem está mais à direita é maior: \\(-5 > -12\\).',
      ],
    },
    {
      problem: 'Ordene do menor para o maior: \\(3,\\ -8,\\ 0,\\ -1\\).',
      steps: [
        'Na reta, da esquerda para a direita: primeiro o \\(-8\\), depois o \\(-1\\), o \\(0\\) e o \\(3\\).',
        'Ordem: \\(-8 < -1 < 0 < 3\\).',
      ],
    },
  ],
};

export default meta;
