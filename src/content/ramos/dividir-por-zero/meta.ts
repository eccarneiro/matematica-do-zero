import type { BranchMeta } from '@/content/types';
import { R } from '@/lib/math/rational';

const meta: BranchMeta = {
  sources: [
    {
      title: 'A history of Zero (regras de Brahmagupta, Mahavira e Bhaskara II para dividir por zero)',
      author: "MacTutor History of Mathematics (J. J. O'Connor e E. F. Robertson), Universidade de St Andrews",
      kind: 'enciclopédia',
      url: 'https://mathshistory.st-andrews.ac.uk/HistTopics/Zero/',
    },
    {
      title: 'Brahmagupta (biografia; Brahmasphutasiddhanta, 628)',
      author: 'MacTutor History of Mathematics, Universidade de St Andrews',
      kind: 'enciclopédia',
      url: 'https://mathshistory.st-andrews.ac.uk/Biographies/Brahmagupta/',
    },
    {
      title: 'Bhaskara II (biografia)',
      author: 'MacTutor History of Mathematics, Universidade de St Andrews',
      kind: 'enciclopédia',
      url: 'https://mathshistory.st-andrews.ac.uk/Biographies/Bhaskara_II/',
    },
    {
      title: 'História da matemática',
      author: 'Carl B. Boyer e Uta C. Merzbach',
      kind: 'livro',
      year: '3ª ed., 2011 (ed. brasileira: Blucher, 2012)',
    },
  ],
  quiz: [
    {
      prompt: 'Quanto é \\(0 \\div 7\\)?',
      answer: { type: 'number', value: R(0) },
      answerText: '0',
      explanation: 'Procuramos o número que, vezes 7, dá 0. Só o zero serve: \\(0 \\times 7 = 0\\). Repartir nada entre 7 dá nada para cada um.',
    },
    {
      prompt: 'Quanto é \\(7 \\div 0\\)?',
      answer: { type: 'choice', options: ['\\(0\\)', '\\(7\\)', 'Infinito', 'Não existe'], correct: 3 },
      explanation: 'Precisaríamos de um número que, vezes 0, desse 7. Mas todo número vezes 0 dá 0. Nenhum passa no teste, então \\(7 \\div 0\\) não existe. "Infinito" também não serve: não é um número que, vezes 0, dê 7.',
    },
    {
      prompt: 'Por que \\(0 \\div 0\\) também não tem um valor definido?',
      answer: {
        type: 'choice',
        options: [
          'Porque todo número, vezes 0, dá 0: qualquer resposta passaria no teste',
          'Porque nenhum número, vezes 0, dá 0',
          'Porque o resultado é 1, já que todo número dividido por ele mesmo dá 1',
          'Porque o resultado é 0, como disse Brahmagupta',
        ],
        correct: 0,
      },
      explanation: 'Em \\(0 \\div 0\\), procuramos \\(? \\times 0 = 0\\), e \\(1\\), \\(5\\), \\(1000\\)… todos servem. Como não há uma resposta só, dizemos que é indeterminado. A regra "dividido por ele mesmo dá 1" só vale para números diferentes de zero.',
    },
    {
      prompt: 'Suponha que \\(1 \\div 0\\) fosse algum número \\(x\\). Pelo teste da multiplicação, \\(x \\times 0\\) teria de dar 1. Mas quanto dá \\(x \\times 0\\), seja qual for \\(x\\)?',
      answer: { type: 'number', value: R(0) },
      answerText: '0',
      explanation: 'Qualquer número vezes zero dá \\(0\\), nunca \\(1\\). A suposição leva a uma contradição, e por isso \\(1 \\div 0\\) não pode ser número nenhum.',
    },
    {
      prompt: 'Quanto é \\(12 \\div 0{,}001\\)?',
      answer: { type: 'number', value: R(12000) },
      answerText: '12000',
      explanation: 'Confira multiplicando: \\(12\\,000 \\times 0{,}001 = 12\\). Quanto menor o divisor, maior o resultado, e ele cresce sem parar quando o divisor se aproxima de zero. Essa é a ideia de limite, que aparece no cálculo.',
    },
  ],
};

export default meta;
