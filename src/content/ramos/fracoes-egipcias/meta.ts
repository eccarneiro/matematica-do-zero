import type { BranchMeta } from '@/content/types';
import { R } from '@/lib/math/rational';

const meta: BranchMeta = {
  sources: [
    {
      title: 'Egyptian mathematics papyri (a tabela de 2/n do papiro de Rhind)',
      author: "MacTutor History of Mathematics (J. J. O'Connor e E. F. Robertson), Universidade de St Andrews",
      kind: 'enciclopédia',
      url: 'https://mathshistory.st-andrews.ac.uk/HistTopics/Egyptian_papyri/',
    },
    {
      title: 'Papiro matemático de Rhind (EA 10057 e EA 10058)',
      author: 'Museu Britânico, Londres',
      kind: 'museu',
    },
    {
      title: 'Egyptian Fraction (Fibonacci, 1202; redescoberta por Sylvester)',
      author: 'Eric W. Weisstein, MathWorld (Wolfram Research)',
      kind: 'enciclopédia',
      url: 'https://mathworld.wolfram.com/EgyptianFraction.html',
    },
    {
      title: 'On a point in the theory of vulgar fractions, American Journal of Mathematics 3',
      author: 'J. J. Sylvester',
      kind: 'artigo',
      year: '1880',
    },
    {
      title: "Fibonacci's Liber Abaci (tradução inglesa)",
      author: 'L. E. Sigler (trad.)',
      kind: 'fonte primária',
      year: '1202 (trad. Springer, 2002)',
    },
  ],
  quiz: [
    {
      prompt: 'Complete a decomposição egípcia: \\(\\frac{3}{4} = \\frac{1}{2} + \\frac{1}{?}\\). Qual é o denominador que falta?',
      answer: { type: 'number', value: R(4) },
      answerText: '4',
      explanation:
        'Tirando \\(\\frac{1}{2} = \\frac{2}{4}\\) de \\(\\frac{3}{4}\\), sobra \\(\\frac{3}{4} - \\frac{2}{4} = \\frac{1}{4}\\). Então \\(\\frac{3}{4} = \\frac{1}{2} + \\frac{1}{4}\\): duas frações unitárias diferentes.',
    },
    {
      prompt: 'O papiro reparte 9 pães entre 10 homens dando a cada um \\(\\frac{2}{3} + \\frac{1}{5} + \\frac{1}{30}\\) de pão. Quanto dá essa soma?',
      answer: { type: 'number', value: R(9, 10) },
      answerText: '9/10',
      explanation:
        'Use o denominador comum 30: \\(\\frac{2}{3} = \\frac{20}{30}\\) e \\(\\frac{1}{5} = \\frac{6}{30}\\). Somando, \\(\\frac{20 + 6 + 1}{30} = \\frac{27}{30} = \\frac{9}{10}\\). Cada homem recebe exatamente 9 décimos de pão.',
    },
    {
      prompt: 'Primeiro passo do método guloso para \\(\\frac{5}{6}\\): qual é a maior fração unitária que cabe em \\(\\frac{5}{6}\\)?',
      answer: { type: 'number', value: R(1, 2) },
      answerText: '1/2',
      explanation:
        '\\(\\frac{1}{1} = 1\\) é maior que \\(\\frac{5}{6}\\), então não cabe. A próxima é \\(\\frac{1}{2} = \\frac{3}{6}\\), que é menor que \\(\\frac{5}{6}\\). Um atalho: \\(6 \\div 5 = 1{,}2\\), e o primeiro inteiro a partir disso é 2.',
      keys: ['/'],
    },
    {
      prompt: 'Continue o método guloso: quanto sobra em \\(\\frac{5}{6} - \\frac{1}{2}\\)?',
      answer: { type: 'number', value: R(1, 3) },
      answerText: '1/3',
      explanation:
        '\\(\\frac{5}{6} - \\frac{3}{6} = \\frac{2}{6} = \\frac{1}{3}\\). O resto já é uma fração unitária, então o método para: \\(\\frac{5}{6} = \\frac{1}{2} + \\frac{1}{3}\\).',
      keys: ['/'],
    },
    {
      prompt: 'Por que os escribas escreviam \\(\\frac{2}{5} = \\frac{1}{3} + \\frac{1}{15}\\), e não \\(\\frac{1}{5} + \\frac{1}{5}\\)?',
      answer: {
        type: 'choice',
        options: [
          'Porque \\(\\frac{1}{5} + \\frac{1}{5}\\) não dá \\(\\frac{2}{5}\\)',
          'Porque as frações unitárias da soma tinham de ser diferentes',
          'Porque eles não conheciam a fração \\(\\frac{1}{5}\\)',
        ],
        correct: 1,
      },
      explanation:
        'A conta \\(\\frac{1}{5} + \\frac{1}{5} = \\frac{2}{5}\\) está certa, e \\(\\frac{1}{5}\\) aparece muito no papiro. Mas a regra do sistema egípcio era usar frações unitárias <strong>diferentes</strong>. Por isso o dobro de \\(\\frac{1}{5}\\) precisava de uma tabela: \\(\\frac{1}{3} + \\frac{1}{15} = \\frac{5 + 1}{15} = \\frac{6}{15} = \\frac{2}{5}\\).',
    },
  ],
};

export default meta;
