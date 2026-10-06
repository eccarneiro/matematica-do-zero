import type { LessonMeta } from '@/content/types';

const meta: LessonMeta = {
  history: { title: 'Negativos de verdade', when: '1685', where: 'Inglaterra', who: 'John Wallis' },
  examples: [
    {
      problem: 'Calcule \\(|-9| + |4|\\) e \\(|-9 + 4|\\).',
      steps: [
        '\\(|-9| = 9\\) e \\(|4| = 4\\), então \\(|-9| + |4| = 13\\).',
        'Já \\(-9 + 4 = -5\\), e \\(|-5| = 5\\).',
        'Os resultados são diferentes: o módulo de uma soma não é a soma dos módulos.',
      ],
    },
    {
      problem: 'Na cidade A fez \\(-7\\,^\\circ\\text{C}\\) e na cidade B, \\(4\\,^\\circ\\text{C}\\). Qual a diferença de temperatura?',
      steps: [
        'A distância entre as duas temperaturas é o módulo da diferença: \\(|4 - (-7)|\\).',
        '\\(4 - (-7) = 4 + 7 = 11\\), então a diferença é de \\(11\\) graus.',
      ],
    },
  ],
};

export default meta;
