import type { BranchMeta } from '@/content/types';
import { R } from '@/lib/math/rational';

const meta: BranchMeta = {
  sources: [
    {
      title: "Peano's axioms for the Natural numbers",
      author: 'MacTutor History of Mathematics, Universidade de St Andrews',
      kind: 'enciclopédia',
      url: 'https://mathshistory.st-andrews.ac.uk/Extras/Peano_axioms/',
    },
    {
      title: 'Giuseppe Peano (biografia; Arithmetices principia, 1889)',
      author: 'MacTutor History of Mathematics, Universidade de St Andrews',
      kind: 'enciclopédia',
      url: 'https://mathshistory.st-andrews.ac.uk/Biographies/Peano/',
    },
    {
      title: 'Arithmetices principia, nova methodo exposita',
      author: 'Giuseppe Peano',
      kind: 'fonte primária',
      year: '1889',
    },
  ],
  quiz: [
    {
      prompt: 'Nos axiomas de Peano (com início no 1), o número \\(3\\) é escrito como…',
      answer: { type: 'choice', options: ["\\(1''\\) (o sucessor do sucessor de 1)", '\\(1 + 1 + 1\\), já que a soma vem antes', '\\(3\\), um símbolo que não precisa de definição'], correct: 0 },
      explanation: "Nos axiomas só existem o 1 e o sucessor. O 2 é \\(1'\\) e o 3 é \\(1''\\). A soma é definida depois, a partir do sucessor.",
    },
    {
      prompt: 'Qual regra garante que a fila dos naturais tem um começo, ou seja, que ninguém "vem antes" do 1?',
      answer: { type: 'choice', options: ['1 não é sucessor de nenhum natural', 'Todo natural tem um sucessor', 'Indução'], correct: 0 },
      explanation: 'Se o 1 fosse sucessor de alguém, haveria um número antes dele. A regra 3 proíbe isso.',
    },
    {
      prompt: 'Se dois números diferentes pudessem ter o mesmo sucessor, a fila dos naturais…',
      answer: { type: 'choice', options: ['se juntaria em algum ponto, como um "Y"', 'ficaria igual, nada mudaria', 'deixaria de ter começo'], correct: 0 },
      explanation: 'A regra 4 impede que dois caminhos se encontrem: cada número tem um único antecessor (menos o 1, que não tem nenhum).',
    },
    {
      prompt: 'Pela fórmula provada por indução, quanto é \\(1 + 2 + 3 + \\dots + 100\\)?',
      answer: { type: 'number', value: R(5050) },
      answerText: '5050',
      explanation: '\\(\\frac{n(n+1)}{2}\\) com \\(n = 100\\): \\(\\frac{100 \\cdot 101}{2} = 5050\\).',
    },
    {
      prompt: 'Para provar algo por indução, além de mostrar que vale para o 1, é preciso mostrar que…',
      answer: { type: 'choice', options: ['se vale para um número, vale para o sucessor dele', 'vale para os 100 primeiros números', 'vale para algum número grande'], correct: 0 },
      explanation: 'É o "efeito dominó": o primeiro cai e cada um derruba o próximo. Testar muitos casos não prova nada para todos.',
    },
  ],
};

export default meta;
