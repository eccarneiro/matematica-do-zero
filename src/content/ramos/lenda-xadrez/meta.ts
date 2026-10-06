import type { BranchMeta } from '@/content/types';
import { R } from '@/lib/math/rational';

const meta: BranchMeta = {
  sources: [
    {
      title: "Ibn Khallikan's Biographical Dictionary, vol. III, verbete de as-Suli, p. 69–71 (tradução inglesa de Mac Guckin de Slane)",
      author: 'Ibn Khallikan',
      kind: 'fonte primária',
      year: 'séc. XIII (tradução de 1843)',
      url: 'https://archive.org/details/de-slane.-w.-m.-trans.-ibn-khallikans-biographical-dictionary-vol.-iii-1843',
    },
    {
      title: 'Os Elementos, Livro IX, Proposição 35 (soma de uma progressão geométrica; tradução inglesa de T. L. Heath, ed. online de D. E. Joyce)',
      author: 'Euclides',
      kind: 'fonte primária',
      year: 'c. 300 a.C.',
      url: 'https://mathcs.clarku.edu/~djoyce/java/elements/bookIX/propIX35.html',
    },
    {
      title: 'Qualidade tecnológica das cultivares de trigo do Ensaio Estadual de Cultivares de Trigo do Rio Grande do Sul, em 2010 (peso de mil grãos)',
      author: 'E. M. Guarienti, J. L. F. Pires, M. Garrafa, M. Só e Silva e M. Z. de Miranda (Embrapa Trigo)',
      kind: 'artigo',
      year: '2011',
      url: 'https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1024057/1/ID431152011reuniaotrigoCD242.pdf',
    },
    {
      title: 'Cereal Supply and Demand Brief (previsão da produção mundial de trigo)',
      author: 'FAO, Organização das Nações Unidas para a Alimentação e a Agricultura',
      kind: 'artigo',
      year: '2026',
      url: 'https://www.fao.org/worldfoodsituation/csdb/en',
    },
  ],
  quiz: [
    {
      prompt: 'Quantos grãos o sábio recebe só na <b>10ª casa</b> do tabuleiro?',
      answer: { type: 'number', value: R(512) },
      answerText: '512',
      explanation:
        'A casa \\(n\\) tem \\(2^{n-1}\\) grãos: a casa 1 tem \\(2^0 = 1\\), a casa 2 tem \\(2^1 = 2\\)… Então a casa 10 tem \\(2^9 = 512\\). Cuidado com o erro comum de responder \\(2^{10} = 1024\\): o expoente fica uma unidade atrás do número da casa, porque a primeira casa começa com \\(2^0\\).',
    },
    {
      prompt: 'E quantos grãos há, ao todo, nas <b>10 primeiras casas</b> juntas?',
      answer: { type: 'number', value: R(1023) },
      answerText: '1023',
      explanation:
        'A soma das potências de 2 é a próxima potência menos 1: \\(1 + 2 + 4 + \\dots + 2^9 = 2^{10} - 1 = 1024 - 1 = 1023\\). Você pode conferir pelo truque de dobrar a soma: \\(2S - S\\) deixa só \\(2^{10} - 1\\).',
    },
    {
      prompt: 'O contador de Alexandria da história de Ibn Khallikan dobrou os grãos até a <b>16ª casa</b>. Quantos grãos ele encontrou nessa casa?',
      answer: { type: 'number', value: R(32768) },
      answerText: '32768',
      explanation:
        'A casa 16 tem \\(2^{15}\\) grãos. Usando \\(2^{10} = 1024\\) e \\(2^5 = 32\\): \\(2^{15} = 1024 \\cdot 32 = 32\\,768\\). É exatamente o número registrado no texto do século XIII.',
    },
    {
      prompt: 'Usando \\(2^{10} \\approx 1000\\), qual é a melhor estimativa para \\(2^{64}\\)?',
      answer: {
        type: 'choice',
        options: ['\\(1{,}6 \\times 10^{19}\\)', '\\(6{,}4 \\times 10^{2}\\)', '\\(1{,}6 \\times 10^{7}\\)', '\\(10^{64}\\)'],
        correct: 0,
      },
      explanation:
        'Separe o expoente em blocos de 10: \\(2^{64} = 2^4 \\cdot (2^{10})^6 \\approx 16 \\cdot (10^3)^6 = 16 \\cdot 10^{18} = 1{,}6 \\times 10^{19}\\). O valor exato é cerca de \\(1{,}8 \\times 10^{19}\\): a estimativa fica um pouco abaixo porque \\(1024\\) é um pouco mais que \\(1000\\). Já \\(10^{64}\\) seria trocar a base 2 pela base 10, um exagero gigantesco.',
    },
    {
      prompt: 'Compare a <b>última casa</b> (\\(2^{63}\\) grãos) com a soma de <b>todas as 63 casas anteriores</b>. O que é verdade?',
      answer: {
        type: 'choice',
        options: [
          'A última casa tem exatamente 1 grão a mais que todas as anteriores juntas.',
          'As casas anteriores juntas têm o dobro da última.',
          'As duas quantidades são iguais.',
          'A última casa tem metade do total das anteriores.',
        ],
        correct: 0,
      },
      explanation:
        'As 63 casas anteriores somam \\(1 + 2 + \\dots + 2^{62} = 2^{63} - 1\\). A última casa sozinha tem \\(2^{63}\\): um grão a mais. Por isso o total do tabuleiro é \\(2^{63} + (2^{63} - 1) = 2^{64} - 1\\).',
    },
  ],
};

export default meta;
