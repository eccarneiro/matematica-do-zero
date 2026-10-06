import type { BranchMeta } from '@/content/types';
import { R } from '@/lib/math/rational';

const meta: BranchMeta = {
  sources: [
    {
      title: 'Mathematical Recreations and Essays, 6ª ed., cap. I ("Four fours problem", p. 14)',
      author: 'W. W. Rouse Ball',
      kind: 'livro',
      year: '1914',
      url: 'https://archive.org/details/mathematicalrecr00ball',
    },
    {
      title: 'Mathematical Recreations and Essays, 7ª ed. (limites 22, 30 e 112 conforme as regras)',
      author: 'W. W. Rouse Ball',
      kind: 'livro',
      year: '1917',
      url: 'https://archive.org/details/mathematicalrecr00ballrich',
    },
    {
      title: 'The Definitive Four Fours Answer Key',
      author: 'David A. Wheeler',
      kind: 'artigo',
      url: 'https://dwheeler.com/fourfours/',
    },
  ],
  quiz: [
    {
      prompt: 'Quanto vale \\((4 + 4) \\div 4 + 4\\)?',
      answer: { type: 'number', value: R(6) },
      answerText: '6',
      explanation: 'Parênteses primeiro: \\(4 + 4 = 8\\). Depois a divisão: \\(8 \\div 4 = 2\\). Por fim a soma: \\(2 + 4 = 6\\).',
    },
    {
      prompt: 'Quanto vale \\(44 \\div 4 - 4\\)?',
      answer: { type: 'number', value: R(7) },
      answerText: '7',
      explanation: 'A divisão vem antes da subtração: \\(44 \\div 4 = 11\\) e \\(11 - 4 = 7\\). O \\(44\\) gasta dois quatros, então a expressão usa exatamente quatro.',
    },
    {
      prompt: 'Quanto vale \\(4 \\times 4 + 4 \\div 4\\)?',
      answer: { type: 'number', value: R(17) },
      answerText: '17',
      explanation: 'Multiplicação e divisão antes da soma: \\(4 \\times 4 = 16\\) e \\(4 \\div 4 = 1\\), logo \\(16 + 1 = 17\\). Quem fizer da esquerda para a direita chega em \\(5\\), que está errado.',
    },
    {
      prompt: 'Qual destas expressões com quatro 4 vale \\(9\\)?',
      answer: {
        type: 'choice',
        options: ['\\(4 + 4 + 4 \\div 4\\)', '\\(4 \\times 4 - 4 - 4\\)', '\\((4 + 4 + 4) \\div 4\\)', '\\(44 \\div 4 + 4\\)'],
        correct: 0,
      },
      explanation: 'Em \\(4 + 4 + 4 \\div 4\\), a divisão vem primeiro: \\(4 + 4 + 1 = 9\\). As outras valem \\(8\\), \\(3\\) e \\(15\\).',
    },
    {
      prompt: 'Qual destas é uma resposta válida para escrever \\(2\\) usando exatamente quatro algarismos 4 e as quatro operações?',
      answer: {
        type: 'choice',
        options: ['\\(4 \\div 4 + 4 \\div 4\\)', '\\(4 - 4 \\div 2\\)', '\\((4 + 4) \\div 4\\)', '\\(4 + 4 - 4 - 4\\)'],
        correct: 0,
      },
      explanation: '\\(4 \\div 4 + 4 \\div 4 = 1 + 1 = 2\\), com quatro 4. A segunda usa um algarismo 2, a terceira só tem três 4 (embora valha 2), e a última vale \\(0\\).',
    },
  ],
};

export default meta;
