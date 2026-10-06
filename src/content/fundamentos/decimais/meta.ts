import type { LessonMeta } from '@/content/types';

const meta: LessonMeta = {
  history: {
    title: 'De Damasco a Flandres: contas com vírgula',
    when: 'séc. X · 1427 · 1585',
    where: 'Damasco, Samarcanda e Flandres',
    who: 'al-Uqlidisi, al-Kashi, Simon Stevin',
  },
  uses: [
    { icon: '💰', title: 'Dinheiro', text: 'Um real tem 100 centavos, então centavo é centésimo: \\(\\text{R\\$}\\,4{,}75\\) são 4 reais e 75 centésimos de real.' },
    { icon: '⛽', title: 'Posto de combustível', text: 'A bomba mostra o preço do litro com três casas, como \\(\\text{R\\$}\\,5{,}899\\), e calcula o total multiplicando decimais: litros \\(\\times\\) preço.' },
    { icon: '📏', title: 'Medidas', text: 'O sistema métrico é todo decimal: \\(1{,}75\\,\\text{m}\\) são 1 metro e 75 centímetros, e \\(2{,}5\\,\\text{kg}\\) são 2 quilos e meio.' },
    { icon: '⏱️', title: 'Esporte', text: 'Corridas são decididas em centésimos de segundo. O recorde mundial dos 100 metros, de Usain Bolt, é \\(9{,}58\\) segundos.' },
    { icon: '🌡️', title: 'Saúde', text: 'Termômetros mostram décimos de grau: \\(36{,}5\\,^\\circ\\text{C}\\) é normal, \\(38{,}2\\,^\\circ\\text{C}\\) já é febre. Doses de remédio também usam decimais, como \\(2{,}5\\,\\text{mL}\\).' },
  ],
  think: {
    question: '0,999... é igual a 1?',
    text: 'Escreva \\(0{,}999\\ldots\\) com os noves continuando para sempre. Parece que sempre falta "um pouquinho" para chegar a 1. Mas \\(\\frac{1}{3} = 0{,}333\\ldots\\), e três vezes isso dá \\(0{,}999\\ldots = \\frac{3}{3} = 1\\). A matemática garante: é exatamente o mesmo número, escrito de dois jeitos. Se a intuição falha aqui, o que isso diz sobre o infinito? E em que mais a nossa intuição pode estar errada?',
  },
  videos: [
    { id: 'OiFoGJMLp5s', title: 'Introdução aos números decimais', channel: 'Khan Academy Brasil' },
    { id: '19ksgzttJ_4', title: 'Revise as 6 operações essenciais com números decimais', channel: 'Gis com Giz' },
  ],
  examples: [
    {
      problem: 'Qual é maior: \\(0{,}5\\) ou \\(0{,}25\\)?',
      steps: [
        'Complete com zero para os dois terem duas casas: \\(0{,}5 = 0{,}50\\).',
        'Agora compare centésimos com centésimos: 50 centésimos contra 25 centésimos.',
        'Logo, \\(0{,}5 > 0{,}25\\). Meio real vale mais do que 25 centavos!',
      ],
    },
    {
      problem: 'Calcule \\(3{,}4 + 1{,}25\\).',
      steps: [
        'Vírgula embaixo de vírgula. Complete com zero: \\(3{,}4 = 3{,}40\\).',
        'Some casa por casa, como inteiros: \\(340 + 125 = 465\\).',
        'Recoloque a vírgula com duas casas: \\(3{,}4 + 1{,}25 = 4{,}65\\).',
      ],
    },
    {
      problem: 'Calcule \\(1{,}2 \\times 0{,}3\\).',
      steps: [
        'Multiplique sem as vírgulas: \\(12 \\times 3 = 36\\).',
        'Cada fator tem 1 casa decimal: o resultado tem \\(1 + 1 = 2\\) casas.',
        'Contando duas casas da direita para a esquerda: \\(1{,}2 \\times 0{,}3 = 0{,}36\\).',
      ],
    },
    {
      problem: 'Um pacote com \\(4{,}5\\,\\text{kg}\\) de arroz vai ser dividido em porções de \\(0{,}15\\,\\text{kg}\\). Quantas porções saem?',
      steps: [
        'A conta é \\(4{,}5 \\div 0{,}15\\).',
        'Multiplique os dois números por 100 para tirar a vírgula do divisor (a divisão não muda): \\(450 \\div 15\\).',
        '\\(450 \\div 15 = 30\\). Saem \\(30\\) porções. Confira: \\(30 \\times 0{,}15 = 4{,}5\\).',
      ],
    },
  ],
};

export default meta;
