import type { BranchMeta } from '@/content/types';
import { R } from '@/lib/math/rational';

const meta: BranchMeta = {
  sources: [
    {
      title: 'Helping Doctors and Patients Make Sense of Health Statistics (Psychological Science in the Public Interest, v. 8, n. 2; o caso da pílula de 1995)',
      author: 'Gerd Gigerenzer, Wolfgang Gaissmaier, Elke Kurz-Milcke, Lisa M. Schwartz e Steven Woloshin',
      kind: 'artigo',
      year: '2007',
      url: 'https://www.stat.berkeley.edu/~aldous/157/Papers/health_stats.pdf',
    },
    {
      title: 'Calculated Risks: How to Know When Numbers Deceive You (ed. brasileira: Saber lidar com o risco)',
      author: 'Gerd Gigerenzer',
      kind: 'livro',
      year: '2002',
    },
    {
      title: 'How to Lie with Statistics (ed. brasileira: Como mentir com estatística)',
      author: 'Darrell Huff',
      kind: 'livro',
      year: '1954',
    },
  ],
  quiz: [
    {
      prompt: 'Um tênis custa R$ 250. A loja aumenta o preço em \\(30\\%\\) e, na semana seguinte, dá um desconto de \\(30\\%\\) sobre o preço novo. Quanto ele passa a custar, em reais?',
      answer: { type: 'number', value: R(455, 2) },
      answerText: '227,50',
      keys: [','],
      explanation:
        'Use os fatores: aumento de \\(30\\%\\) é \\(\\times 1{,}3\\) e desconto de \\(30\\%\\) é \\(\\times 0{,}7\\). Então \\(250 \\cdot 1{,}3 \\cdot 0{,}7 = 250 \\cdot 0{,}91 = 227{,}50\\). Não volta aos R$ 250: o desconto foi calculado sobre R$ 325, uma base maior, e no total o preço caiu \\(9\\%\\).',
    },
    {
      prompt: 'A taxa de juros de um empréstimo passou de \\(8\\%\\) para \\(10\\%\\) ao ano. Ela subiu quantos <b>pontos percentuais</b>?',
      answer: { type: 'number', value: R(2) },
      answerText: '2',
      explanation:
        'Pontos percentuais são a diferença simples entre as duas taxas: \\(10 - 8 = 2\\) p.p. Repare que isso não é o mesmo que "subiu \\(2\\%\\)". A próxima pergunta mostra a variação relativa.',
    },
    {
      prompt: 'E em relação ao valor antigo, a taxa que passou de \\(8\\%\\) para \\(10\\%\\) aumentou quantos por cento?',
      answer: { type: 'number', value: R(25) },
      answerText: '25',
      keys: ['%'],
      explanation:
        'A variação relativa compara o aumento com a base antiga: \\(\\dfrac{10 - 8}{8} = \\dfrac{2}{8} = 0{,}25 = 25\\%\\). Então as duas frases estão certas: "subiu 2 pontos percentuais" e "subiu \\(25\\%\\)".',
    },
    {
      prompt: 'Um estudo mostra que um efeito colateral raro passa de 2 casos em cada 10.000 pessoas para 3 casos em cada 10.000 com um remédio novo. Qual manchete está <b>correta</b>?',
      answer: {
        type: 'choice',
        options: [
          'Remédio novo aumenta o risco em \\(50\\%\\): de 2 para 3 casos em cada 10 mil pessoas.',
          'Remédio novo aumenta o risco em \\(1\\%\\).',
          'Remédio novo faz o risco subir para \\(50\\%\\).',
          'Remédio novo aumenta o risco em \\(3\\%\\).',
        ],
        correct: 0,
      },
      explanation:
        'O risco relativo subiu \\(\\dfrac{3 - 2}{2} = 50\\%\\), mas o absoluto subiu só 1 caso em cada 10.000, ou \\(0{,}01\\) ponto percentual. A primeira manchete é a única correta e, melhor ainda, mostra os números de antes e depois. "Subir para \\(50\\%\\)" confunde aumento com o risco final, e \\(1\\%\\) e \\(3\\%\\) não correspondem a conta nenhuma.',
    },
    {
      prompt: 'Uma ação caiu \\(20\\%\\). De quantos por cento ela precisa <b>subir</b> agora para voltar ao valor original?',
      answer: { type: 'number', value: R(25) },
      answerText: '25',
      keys: ['%'],
      explanation:
        'Depois da queda, ela vale \\(0{,}8\\) do original. Para voltar a \\(1\\), o fator de subida precisa ser \\(1 \\div 0{,}8 = 1{,}25\\), ou seja, um aumento de \\(25\\%\\). Os \\(20\\%\\) não bastam porque agora a base é menor: \\(0{,}8 \\cdot 1{,}2 = 0{,}96\\).',
    },
  ],
};

export default meta;
