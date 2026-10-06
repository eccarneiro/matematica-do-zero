import type { LessonMeta } from '@/content/types';

const meta: LessonMeta = {
  history: { title: 'Riscos num osso', when: 'c. 20 mil anos atrás', where: 'Ishango, África Central', who: 'Caçadores-coletores anônimos' },
  examples: [
    {
      problem: 'Quantos números naturais há de \\(15\\) até \\(40\\), contando os dois?',
      steps: [
        'A diferença \\(40 - 15 = 25\\) conta os "pulos" de um número para o seguinte.',
        'Como o 15 e o 40 entram na conta, somamos 1: \\(25 + 1 = 26\\).',
        'Confira com um caso pequeno: de 1 até 3 há 3 números, e \\(3 - 1 + 1 = 3\\).',
      ],
    },
    {
      problem: 'Qual é o antecessor de \\(1.000\\)? E o sucessor de \\(9.999\\)?',
      steps: [
        'Antecessor é tirar 1: \\(1.000 - 1 = 999\\).',
        'Sucessor é somar 1: \\(9.999 + 1 = 10.000\\). Todas as casas "viram", como num hodômetro.',
      ],
    },
  ],
};

export default meta;
