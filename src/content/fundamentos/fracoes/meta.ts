import type { LessonMeta } from '@/content/types';

const meta: LessonMeta = {
  history: {
    title: 'Pães, cheias do Nilo e um escriba chamado Ahmes',
    when: 'c. 1650 a.C. · séc. XII · 1202 d.C.',
    where: 'Egito, norte da África e Itália',
    who: 'O escriba Ahmes, al-Hassar, Fibonacci',
  },
  uses: [
    { icon: '🍳', title: 'Receitas', text: '\\(\\tfrac{3}{4}\\) de xícara de açúcar, \\(\\tfrac{1}{2}\\) colher de fermento. Para fazer meia receita, você calcula \\(\\tfrac{1}{2}\\) de cada medida: \\(\\tfrac{1}{2} \\cdot \\tfrac{3}{4} = \\tfrac{3}{8}\\).' },
    { icon: '🎵', title: 'Música', text: 'As figuras musicais são frações da semibreve: a mínima vale \\(\\tfrac{1}{2}\\), a semínima \\(\\tfrac{1}{4}\\), a colcheia \\(\\tfrac{1}{8}\\). Um compasso \\(\\tfrac{3}{4}\\) (o da valsa) tem três semínimas.' },
    { icon: '🔧', title: 'Canos e ferramentas', text: 'Na loja de material de construção, canos e conexões são vendidos em polegadas: \\(\\tfrac{1}{2}\\)", \\(\\tfrac{3}{4}\\)". Chaves de boca também: \\(\\tfrac{3}{8}\\)", \\(\\tfrac{7}{16}\\)"...' },
    { icon: '⏰', title: 'Tempo', text: 'Meia hora é \\(\\tfrac{1}{2}\\) de 60 minutos, e "um quarto de hora" é \\(\\tfrac{1}{4}\\) de 60 = 15 minutos. Um tempo de futebol é \\(\\tfrac{1}{2}\\) do jogo.' },
    { icon: '🗺️', title: 'Mapas e plantas', text: 'Uma escala \\(1 : 50\\,000\\) quer dizer que cada distância no mapa é \\(\\tfrac{1}{50\\,000}\\) da distância real: 1 cm no papel são 500 m no chão.' },
  ],
  think: {
    question: 'Se você divide algo ao meio infinitas vezes, sobra alguma coisa?',
    text: 'Há 2.500 anos, o grego Zenão de Eleia propôs um enigma: para atravessar uma sala, você precisa primeiro chegar à metade; depois, à metade do que falta; depois, à metade do que ainda falta... São infinitas etapas: \\(\\tfrac{1}{2} + \\tfrac{1}{4} + \\tfrac{1}{8} + \\dots\\) Como alguém consegue chegar ao outro lado? E será que dá para cortar uma pizza (ou o espaço, ou o tempo) em pedaços cada vez menores para sempre, ou existe um pedaço tão pequeno que não se divide mais?',
  },
  videos: [
    { id: 'YJyY6A_MOQc', title: 'Frações (parte 1): notação e propriedades', channel: 'Professor Ferretto' },
    { id: 'ZU-DAqtVkmI', title: 'Adição e subtração de frações', channel: 'Gis com Giz' },
  ],
  examples: [
    {
      problem: 'Simplifique \\(\\dfrac{18}{24}\\).',
      steps: [
        'Os dois números são pares: dividindo em cima e embaixo por 2, \\(\\dfrac{18}{24} = \\dfrac{9}{12}\\).',
        '9 e 12 estão na tabuada do 3: dividindo por 3, \\(\\dfrac{9}{12} = \\dfrac{3}{4}\\).',
        '3 e 4 não têm divisor comum além do 1. Resposta: \\(\\dfrac{3}{4}\\). (Atalho: dividir direto pelo mdc, que é 6.)',
      ],
    },
    {
      problem: 'Calcule \\(\\dfrac{2}{3} + \\dfrac{1}{4}\\).',
      steps: [
        'Terços e quartos são pedaços de tamanhos diferentes. Procure um tamanho comum: \\(\\text{mmc}(3, 4) = 12\\).',
        'Reescreva: \\(\\dfrac{2}{3} = \\dfrac{8}{12}\\) (multiplicando por 4) e \\(\\dfrac{1}{4} = \\dfrac{3}{12}\\) (multiplicando por 3).',
        'Agora os pedaços são iguais: \\(\\dfrac{8}{12} + \\dfrac{3}{12} = \\dfrac{11}{12}\\).',
      ],
    },
    {
      problem: 'Quanto é \\(\\dfrac{3}{5}\\) de 40 reais?',
      steps: [
        'Divida os 40 reais em 5 partes iguais: \\(40 \\div 5 = 8\\). Cada quinto vale 8 reais.',
        'Pegue 3 dessas partes: \\(3 \\cdot 8 = 24\\).',
        'Resposta: 24 reais.',
      ],
    },
    {
      problem: 'Calcule \\(3 \\div \\dfrac{1}{4}\\) e \\(\\dfrac{2}{3} \\div \\dfrac{4}{5}\\).',
      steps: [
        'Quantos quartos cabem em 3 inteiros? Cada inteiro tem 4 quartos, então \\(3 \\div \\dfrac{1}{4} = 3 \\cdot 4 = 12\\).',
        'Dividir por uma fração é multiplicar pelo inverso dela: \\(\\dfrac{2}{3} \\div \\dfrac{4}{5} = \\dfrac{2}{3} \\cdot \\dfrac{5}{4}\\).',
        '\\(\\dfrac{2 \\cdot 5}{3 \\cdot 4} = \\dfrac{10}{12} = \\dfrac{5}{6}\\).',
      ],
    },
  ],
};

export default meta;
