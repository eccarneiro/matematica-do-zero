import type { BranchMeta } from '@/content/types';
import { R } from '@/lib/math/rational';

const meta: BranchMeta = {
  sources: [
    {
      title: 'Pythagoras\'s theorem in Babylonian mathematics (tábua YBC 7289 e o valor 1;24,51,10)',
      author: "MacTutor History of Mathematics (J. J. O'Connor e E. F. Robertson), Universidade de St Andrews",
      kind: 'enciclopédia',
      url: 'https://mathshistory.st-andrews.ac.uk/HistTopics/Babylonian_Pythagoras/',
    },
    {
      title: 'Primeiros Analíticos, Livro I, parte 23 (tradução inglesa de A. J. Jenkinson)',
      author: 'Aristóteles',
      kind: 'fonte primária',
      year: 'séc. IV a.C.',
      url: 'https://classics.mit.edu/Aristotle/prior.mb.txt',
    },
    {
      title: 'How a Secret Society Discovered Irrational Numbers (sobre a lenda de Hípaso)',
      author: 'Manon Bischoff, Scientific American',
      kind: 'artigo',
      year: '2024',
      url: 'https://www.scientificamerican.com/article/how-a-secret-society-discovered-irrational-numbers',
    },
    {
      title: 'História da Matemática',
      author: 'Carl B. Boyer e Uta C. Merzbach',
      kind: 'livro',
      year: '3ª ed. brasileira, Blucher, 2012',
    },
  ],
  quiz: [
    {
      prompt: 'No passo 3 da demonstração, sabemos que \\(a^2\\) é par. O que podemos concluir sobre \\(a\\)?',
      answer: {
        type: 'choice',
        options: ['\\(a\\) é par.', '\\(a\\) é ímpar.', 'Pode ser par ou ímpar.', '\\(a\\) é primo.'],
        correct: 0,
      },
      explanation:
        'Ímpar ao quadrado é sempre ímpar: \\((2k+1)^2 = 4k^2 + 4k + 1\\), que deixa resto 1 na divisão por 2. Então, se \\(a^2\\) é par, \\(a\\) não pode ser ímpar: \\(a\\) é par.',
    },
    {
      prompt: 'Partindo de \\(a^2 = 2b^2\\) e trocando \\(a\\) por \\(2k\\), a que igualdade chegamos?',
      answer: {
        type: 'choice',
        options: ['\\(b^2 = 2k^2\\)', '\\(b^2 = 4k^2\\)', '\\(b = 2k\\)', '\\(b^2 = k^2\\)'],
        correct: 0,
      },
      explanation:
        '\\((2k)^2 = 4k^2\\), então \\(4k^2 = 2b^2\\). Dividindo os dois lados por 2: \\(b^2 = 2k^2\\). Agora \\(b^2\\) é par e, pelo mesmo argumento de antes, \\(b\\) também é par.',
    },
    {
      prompt: 'No fim, descobrimos que \\(a\\) e \\(b\\) são os dois pares. Por que isso é uma contradição?',
      answer: {
        type: 'choice',
        options: [
          'Porque supusemos que a fração \\(\\frac{a}{b}\\) já estava simplificada ao máximo.',
          'Porque nenhum número par pode ser elevado ao quadrado.',
          'Porque \\(a\\) deveria ser maior que \\(b\\).',
          'Porque \\(\\sqrt{2}\\) é par.',
        ],
        correct: 0,
      },
      explanation:
        'Se \\(a\\) e \\(b\\) fossem pares, daria para dividir os dois por 2 e simplificar a fração, mas tínhamos suposto que ela já estava na forma mais simples. Como toda fração pode ser simplificada até o fim, o erro só pode estar na suposição inicial: \\(\\sqrt{2}\\) não é uma fração.',
    },
    {
      prompt: 'Teste uma aproximação: quanto é \\(1{,}41^2\\)?',
      answer: { type: 'number', value: R(19881, 10000) },
      answerText: '1,9881',
      keys: [','],
      explanation:
        '\\(1{,}41 \\cdot 1{,}41 = 1{,}9881\\). Fica pertinho de 2, mas não chega. Com \\(1{,}42\\) passaria: \\(1{,}42^2 = 2{,}0164\\). Então \\(1{,}41 < \\sqrt{2} < 1{,}42\\), e dá para continuar apertando para sempre, casa por casa, sem nunca acertar em cheio.',
    },
    {
      prompt: 'Qual fração de denominador 5 mais se aproxima de \\(\\sqrt{2}\\)? Escreva no formato \\(\\frac{a}{5}\\).',
      answer: { type: 'number', value: R(7, 5) },
      answerText: '7/5',
      keys: ['/'],
      explanation:
        'Queremos \\(\\frac{a}{5}\\) com \\(\\left(\\frac{a}{5}\\right)^2 = \\frac{a^2}{25}\\) perto de 2, ou seja, \\(a^2\\) perto de \\(50\\). Como \\(7^2 = 49\\) e \\(8^2 = 64\\), a melhor é \\(\\frac{7}{5} = 1{,}4\\), já que \\(\\sqrt{2} \\approx 1{,}414\\) está bem mais perto de \\(1{,}4\\) do que de \\(1{,}6\\).',
    },
  ],
};

export default meta;
