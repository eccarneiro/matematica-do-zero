import type { LessonMeta } from '@/content/types';

const meta: LessonMeta = {
  history: {
    title: 'Do imposto de Augusto ao "per cento" dos mercadores',
    when: 'séc. I a.C. · séc. XV a XVII',
    where: 'Roma antiga e Itália',
    who: 'Augusto, mercadores e banqueiros italianos',
  },
  uses: [
    { icon: '🏷️', title: 'Promoções', text: 'Uma etiqueta de "30% off" em algo de R$ 150 quer dizer pagar \\(70\\%\\) do preço: \\(150 \\cdot 0{,}7 = 105\\) reais.' },
    { icon: '💳', title: 'Juros do cartão', text: 'O rotativo do cartão de crédito cobra uma porcentagem <b>ao mês</b> sobre a dívida, e esses juros se acumulam. Saber calcular isso evita armadilhas.' },
    { icon: '🧾', title: 'Impostos e gorjeta', text: 'Os "10% do garçom" numa conta de R$ 86 são \\(8{,}60\\) reais. Impostos sobre produtos e salários também são definidos em porcentagens.' },
    { icon: '📊', title: 'Pesquisas e notícias', text: 'Intenção de voto, inflação, desemprego: porcentagens permitem comparar grupos de tamanhos diferentes, como uma cidade pequena e um país inteiro.' },
    { icon: '🔋', title: 'Bateria e downloads', text: 'O celular mostra a carga como porcentagem da capacidade total; a barra de download mostra que parte do arquivo já chegou.' },
  ],
  think: {
    question: 'Por que nossa intuição falha com porcentagens?',
    text: 'Se uma ação sobe \\(50\\%\\) e depois cai \\(50\\%\\), parece que "empatou", mas você perdeu um quarto do dinheiro. Uma manchete diz que algo "dobra o risco" de uma doença: assusta, mas se o risco era de 1 em 100 mil, passou a 2 em 100 mil. Porcentagens sempre são <b>de alguma coisa</b>. Quando a notícia esconde qual é essa coisa, o número pode informar ou enganar. Como saber qual dos dois está acontecendo?',
  },
  videos: [
    { id: 'OjOyNmTt7Mw', title: 'Porcentagem: como calcular porcentagem', channel: 'Gis com Giz' },
    { id: '3EefFSEF8Ds', title: 'Porcentagem: aumento e desconto', channel: 'Dicasdemat Sandro Curió' },
  ],
  examples: [
    {
      problem: 'Calcule \\(35\\%\\) de \\(240\\).',
      steps: [
        '\\(10\\%\\) de \\(240\\) é \\(24\\) (dividir por 10).',
        '\\(30\\%\\) é três vezes isso: \\(3 \\cdot 24 = 72\\). E \\(5\\%\\) é a metade de \\(10\\%\\): \\(12\\).',
        'Juntando: \\(35\\% = 30\\% + 5\\%\\), então \\(72 + 12 = 84\\).',
        'Conferindo pela fração: \\(0{,}35 \\cdot 240 = 84\\).',
      ],
    },
    {
      problem: 'Numa prova de 25 questões, Ana acertou 18. Qual foi a porcentagem de acertos?',
      steps: [
        'Parte sobre todo: \\(\\frac{18}{25}\\).',
        'Para chegar a denominador 100, multiplique em cima e embaixo por 4: \\(\\frac{18}{25} = \\frac{72}{100}\\).',
        'Ana acertou \\(72\\%\\) da prova.',
      ],
    },
    {
      problem: 'Uma bicicleta de R$ 1.200 está com \\(15\\%\\) de desconto. Quanto ela custa?',
      steps: [
        'Com \\(15\\%\\) de desconto, você paga \\(100\\% - 15\\% = 85\\%\\) do preço: o fator é \\(0{,}85\\).',
        '\\(1{.}200 \\cdot 0{,}85 = 1{.}020\\).',
        'A bicicleta sai por \\(\\text{R\\$}\\,1{.}020\\). (O desconto foi de \\(180\\) reais.)',
      ],
    },
    {
      problem: 'Depois de um aumento de \\(25\\%\\), uma conta passou a custar R$ 150. Quanto ela custava antes?',
      steps: [
        'Aumento de \\(25\\%\\) é multiplicar por \\(1{,}25\\): \\(\\text{antes} \\cdot 1{,}25 = 150\\).',
        'Volte dividindo: \\(150 \\div 1{,}25 = 120\\).',
        'Cuidado: tirar \\(25\\%\\) de 150 daria \\(112{,}50\\), que está errado, porque o aumento foi calculado sobre o valor antigo, não sobre o novo.',
        'Conferindo: \\(120 \\cdot 1{,}25 = 150\\). A conta custava \\(\\text{R\\$}\\,120\\).',
      ],
    },
  ],
};

export default meta;
