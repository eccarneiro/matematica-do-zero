import type { BranchMeta } from '@/content/types';
import { R } from '@/lib/math/rational';

const meta: BranchMeta = {
  sources: [
    {
      title: 'Mathematics in Egyptian papyri (o método de multiplicação do Papiro de Rhind)',
      author: "MacTutor History of Mathematics (J. J. O'Connor e E. F. Robertson), Universidade de St Andrews",
      kind: 'enciclopédia',
      url: 'https://mathshistory.st-andrews.ac.uk/HistTopics/Egyptian_papyri/',
    },
    {
      title: 'An overview of Egyptian mathematics (datação do Papiro de Rhind e o escriba Ahmes)',
      author: "MacTutor History of Mathematics (J. J. O'Connor e E. F. Robertson), Universidade de St Andrews",
      kind: 'enciclopédia',
      url: 'https://mathshistory.st-andrews.ac.uk/HistTopics/Egyptian_mathematics/',
    },
    {
      title: 'A History of Mathematics: An Introduction (cap. 1, Egito)',
      author: 'Victor J. Katz',
      kind: 'livro',
      year: '3ª ed., 2009',
    },
  ],
  quiz: [
    {
      prompt: 'Dobrando o 21, temos \\(21, 42, 84, 168\\) nas linhas \\(1, 2, 4, 8\\). Como \\(13 = 8 + 4 + 1\\), quanto é \\(13 \\times 21\\)?',
      answer: { type: 'number', value: R(273) },
      answerText: '273',
      explanation: 'Somamos as linhas marcadas: \\(168 + 84 + 21 = 273\\). Funciona porque \\((8 + 4 + 1) \\times 21 = 8 \\times 21 + 4 \\times 21 + 1 \\times 21\\).',
    },
    {
      prompt: 'Para multiplicar por 23 no método egípcio, quais linhas da coluna \\(1, 2, 4, 8, 16\\) você deve somar?',
      answer: {
        type: 'choice',
        options: ['\\(16 + 4 + 2 + 1\\)', '\\(16 + 8 + 1\\)', '\\(8 + 8 + 4 + 2 + 1\\)', '\\(16 + 4 + 3\\)'],
        correct: 0,
      },
      explanation: 'Pegue o maior que cabe: \\(23 - 16 = 7\\), depois \\(7 - 4 = 3\\), \\(3 - 2 = 1\\), \\(1 - 1 = 0\\). Logo \\(23 = 16 + 4 + 2 + 1\\). As outras opções somam 25, repetem o 8 ou usam o 3, que não está na coluna.',
    },
    {
      prompt: 'A tabela de dobros do 25 é \\(25, 50, 100, 200, 400\\) (linhas \\(1, 2, 4, 8, 16\\)). Use-a para calcular \\(19 \\times 25\\).',
      answer: { type: 'number', value: R(475) },
      answerText: '475',
      explanation: 'Como \\(19 = 16 + 2 + 1\\), somamos as linhas 16, 2 e 1: \\(400 + 50 + 25 = 475\\).',
    },
    {
      prompt: 'Calcule \\(26 \\times 12\\) dobrando o 12: \\(12, 24, 48, 96, 192\\) (linhas \\(1, 2, 4, 8, 16\\)).',
      answer: { type: 'number', value: R(312) },
      answerText: '312',
      explanation: 'Escrevemos \\(26 = 16 + 8 + 2\\) e somamos as linhas correspondentes: \\(192 + 96 + 24 = 312\\). A linha do 1 fica de fora, porque 26 é par.',
    },
    {
      prompt: 'Por que, no método egípcio, nunca é preciso usar a mesma linha duas vezes?',
      answer: {
        type: 'choice',
        options: [
          'Porque todo número inteiro positivo é uma soma de potências de 2 diferentes (a sua escrita em binário)',
          'Porque os egípcios só multiplicavam números pares',
          'Porque a coluna de dobros sempre termina num número maior que o resultado',
          'Na verdade às vezes é preciso, e então se soma a linha duas vezes',
        ],
        correct: 0,
      },
      explanation: 'Tirando sempre a maior potência de 2 que cabe, o que sobra é menor que ela, então a mesma linha não volta a ser usada. Essa soma de potências de 2 diferentes é a escrita do número em base 2, e ela sempre existe e é única.',
    },
  ],
};

export default meta;
