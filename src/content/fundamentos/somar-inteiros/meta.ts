import type { LessonMeta } from '@/content/types';

const meta: LessonMeta = {
  history: { title: 'Fortunas e dívidas', when: '628', where: 'Índia', who: 'Brahmagupta' },
  uses: [
    { icon: '🏦', title: 'Dinheiro e dívidas', text: 'Saldo de \\(-R\\$\\,50\\) e um depósito de \\(R\\$\\,80\\)? Fica \\(-50 + 80 = 30\\).' },
    { icon: '🌡️', title: 'Variação de temperatura', text: 'De \\(-4\\,^\\circ\\text{C}\\) para \\(7\\,^\\circ\\text{C}\\), a temperatura subiu \\(7 - (-4) = 11\\) graus.' },
  ],
  videos: [{ id: '68CP_MPzXqo', title: 'Adição e subtração com números positivos e negativos', channel: 'Gis com Giz' }],
  examples: [
    {
      problem: 'Calcule \\(-8 - (-3) + 2\\).',
      steps: [
        'Subtrair \\(-3\\) é somar \\(3\\): a conta vira \\(-8 + 3 + 2\\).',
        '\\(-8 + 3 = -5\\) (sinais diferentes: \\(8 - 3 = 5\\), fica o sinal do \\(-8\\)).',
        '\\(-5 + 2 = -3\\).',
      ],
    },
    {
      problem: 'Em Urupema (SC), fez \\(-6\\,^\\circ\\text{C}\\) às 6h e \\(9\\,^\\circ\\text{C}\\) ao meio-dia. Quanto a temperatura subiu?',
      steps: [
        'Variação é "final menos inicial": \\(9 - (-6)\\).',
        'Subtrair \\(-6\\) é somar 6: \\(9 + 6 = 15\\) graus.',
      ],
    },
  ],
};

export default meta;
