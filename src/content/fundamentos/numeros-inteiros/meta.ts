import type { LessonMeta } from '@/content/types';

const meta: LessonMeta = {
  history: {
    title: 'De riscos num osso às dívidas de Brahmagupta',
    when: 'c. 20 mil anos atrás · séc. II a.C. · 628 d.C.',
    where: 'África Central, China e Índia',
    who: 'Calculistas chineses, Liu Hui, Brahmagupta',
  },
  uses: [
    { icon: '🌡️', title: 'Temperatura', text: 'Termômetros vão abaixo de zero. Passar de \\(-4\\,^\\circ\\text{C}\\) para \\(7\\,^\\circ\\text{C}\\) é subir 11 graus: \\(7 - (-4) = 11\\).' },
    { icon: '🏦', title: 'Dinheiro e dívidas', text: 'O saldo do banco fica negativo quando você gasta mais do que tem. É a mesma ideia de Brahmagupta: fortunas e dívidas.' },
    { icon: '🛗', title: 'Andares e altitudes', text: 'Elevador com subsolo (\\(-1, -2\\)), o fundo do mar abaixo do nível do mar, o Mar Morto a cerca de 430 m abaixo dele.' },
    { icon: '⚽', title: 'Saldo de gols', text: 'Um time que fez 20 gols e sofreu 27 tem saldo \\(20 - 27 = -7\\). A tabela usa inteiros para desempatar.' },
    { icon: '💻', title: 'Computadores', text: 'Processadores guardam inteiros negativos com um truque chamado complemento de dois, que transforma toda subtração em soma: a mesma ideia de "somar o oposto".' },
  ],
  think: {
    question: 'Números negativos existem de verdade?',
    text: 'Ninguém nunca viu \\(-3\\) maçãs. Mesmo assim, os negativos descrevem perfeitamente dívidas, temperaturas e direções. Eles são uma descoberta sobre o mundo ou uma invenção útil, como uma ferramenta? Durante séculos, matemáticos sérios os chamaram de "absurdos". O que faz uma ideia matemática deixar de ser absurda?',
  },
  videos: [
    { id: 'QpxmeCSGAlM', title: 'Introdução aos números negativos', channel: 'Khan Academy Brasil' },
    { id: '68CP_MPzXqo', title: 'Adição e subtração com números positivos e negativos', channel: 'Gis com Giz' },
  ],
  examples: [
    {
      problem: 'Qual é maior: \\(-12\\) ou \\(-5\\)?',
      steps: [
        'Na reta numérica, \\(-12\\) fica 12 casas à esquerda do zero e \\(-5\\) fica 5 casas à esquerda.',
        'Quem está mais à direita é maior. Então \\(-5 > -12\\).',
        'Dica para lembrar: dever 5 reais é melhor do que dever 12.',
      ],
    },
    {
      problem: 'Calcule \\(-8 - (-3) + 2\\).',
      steps: [
        'Subtrair \\(-3\\) é somar o oposto, \\(+3\\): a conta vira \\(-8 + 3 + 2\\).',
        '\\(-8 + 3\\): sinais diferentes, \\(8 - 3 = 5\\), e fica o sinal do \\(-8\\): \\(-5\\).',
        '\\(-5 + 2\\): sinais diferentes, \\(5 - 2 = 3\\), sinal do \\(-5\\): \\(-3\\).',
        'Resposta: \\(-8 - (-3) + 2 = -3\\).',
      ],
    },
    {
      problem: 'Em Urupema (SC), a temperatura era \\(-6\\,^\\circ\\text{C}\\) às 6h e \\(9\\,^\\circ\\text{C}\\) ao meio-dia. Quantos graus ela subiu?',
      steps: [
        'A variação é "final menos inicial": \\(9 - (-6)\\).',
        'Subtrair \\(-6\\) é somar 6: \\(9 + 6 = 15\\).',
        'Ela subiu \\(15\\) graus: 6 até chegar ao zero e mais 9 depois dele.',
      ],
    },
    {
      problem: 'Calcule \\((-4) \\cdot (-6)\\) e \\((-35) \\div 7\\).',
      steps: [
        'Na multiplicação, sinais iguais dão resultado positivo: \\(4 \\cdot 6 = 24\\), então \\((-4)\\cdot(-6) = 24\\).',
        'Na divisão, sinais diferentes dão resultado negativo: \\(35 \\div 7 = 5\\), então \\((-35) \\div 7 = -5\\).',
      ],
    },
  ],
};

export default meta;
