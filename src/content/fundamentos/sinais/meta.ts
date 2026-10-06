import type { LessonMeta } from '@/content/types';

const meta: LessonMeta = {
  history: { title: 'Números absurdos', when: '628 · 1544', where: 'Índia e Alemanha', who: 'Brahmagupta, Michael Stifel' },
  think: {
    question: 'Por que "menos com menos dá mais"?',
    text: 'A regra pode ser vista como um padrão que precisa continuar, como uma inversão de sentido ou como uma consequência das outras regras da aritmética. Ela é uma verdade que descobrimos ou uma escolha que fizemos para que tudo funcione junto?',
  },
  examples: [
    {
      problem: 'Calcule \\((-4) \\cdot (-6)\\) e \\((-35) \\div 7\\).',
      steps: [
        'Sem sinais, \\(4 \\cdot 6 = 24\\). Sinais iguais dão resultado positivo: \\((-4)\\cdot(-6) = 24\\).',
        'Sem sinais, \\(35 \\div 7 = 5\\). Sinais diferentes dão resultado negativo: \\((-35) \\div 7 = -5\\).',
      ],
    },
    {
      problem: 'Qual o sinal de \\((-2)\\cdot(-3)\\cdot(-5)\\)?',
      steps: [
        'Cada negativo vira o sentido uma vez. São três negativos: vira, vira de volta, vira de novo.',
        'Número ímpar de negativos dá resultado negativo: \\((-2)\\cdot(-3)\\cdot(-5) = -30\\).',
      ],
    },
  ],
};

export default meta;
