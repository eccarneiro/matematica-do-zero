import type { LessonMeta } from '@/content/types';

const meta: LessonMeta = {
  history: {
    title: 'O nada que virou número',
    when: 'séculos a.C. · 628 d.C. · 1202',
    where: 'Mesopotâmia, América Central, Índia, Bagdá e Europa',
    who: 'Babilônios, maias, Brahmagupta, al-Khwarizmi, Fibonacci',
  },
  uses: [
    { icon: '💻', title: 'Computadores', text: 'Todo dado digital é escrito só com 0 e 1, num sistema posicional de base 2, em que o zero marca as casas vazias: \\(101\\) em binário vale \\(4 + 0 + 1 = 5\\).' },
    { icon: '🧾', title: 'Cheques e contratos', text: 'Um zero a mais transforma R$ 150 em R$ 1.500. Por isso cheques e contratos repetem o valor por extenso: assim ninguém consegue acrescentar zeros depois.' },
    { icon: '🌡️', title: 'Zero de referência', text: 'Em \\(0\\,^\\circ\\text{C}\\) a água congela, mas isso não é "falta de temperatura". Nas escalas, o zero é um ponto de partida escolhido, e dá para ir abaixo dele.' },
    { icon: '📮', title: 'Códigos com zero à esquerda', text: 'No CEP 01310-100 ou num número de telefone, o zero à esquerda importa, porque é um código, não uma quantidade. Já na quantidade \\(007\\), ele não muda nada: é só \\(7\\).' },
    { icon: '🔭', title: 'Números gigantes', text: 'Um bilhão é \\(1\\) seguido de nove zeros: \\(10^9\\). Cientistas escrevem distâncias e populações enormes contando zeros, e cada zero a mais multiplica por 10.' },
  ],
  think: {
    question: 'Como o "nada" pode ser alguma coisa?',
    text: 'Ninguém consegue mostrar "zero maçãs" na mão. Mesmo assim, o zero é um número com regras tão firmes quanto as do 7. Por séculos, muitos estudiosos desconfiaram de um símbolo para o vazio. O zero existe, ou é só uma ferramenta que inventamos para falar da ausência? E faz diferença saber a resposta?',
  },
  videos: [
    { id: '_gPWM_RIAOo', title: 'Introdução ao valor posicional', channel: 'Khan Academy Brasil' },
    { id: 'C812J7_hqTg', title: 'Sistema de numeração decimal ou base dez', channel: 'Professor Ferretto' },
  ],
  examples: [
    {
      problem: 'Quanto vale cada algarismo de \\(2{.}048\\)?',
      steps: [
        'Da direita para a esquerda: \\(8\\) unidades, \\(4\\) dezenas, \\(0\\) centenas e \\(2\\) unidades de milhar.',
        'Valores: o \\(8\\) vale \\(8\\), o \\(4\\) vale \\(40\\), o \\(0\\) vale \\(0\\) e o \\(2\\) vale \\(2{.}000\\).',
        'Conferindo: \\(2{.}000 + 0 + 40 + 8 = 2{.}048\\). O zero não soma nada, mas mantém o \\(2\\) na casa dos milhares.',
      ],
    },
    {
      problem: 'Escreva o número que tem 5 milhares, 3 dezenas e 8 unidades.',
      steps: [
        'Uma casa para cada posição, da maior até as unidades: milhares, centenas, dezenas, unidades.',
        'Não há centenas, então essa casa fica vazia e recebe um \\(0\\).',
        'O número é \\(5{.}038\\). Sem o zero, escreveríamos \\(538\\), que é outro número.',
      ],
    },
    {
      problem: 'Calcule \\(9 \\times 0 + 0 \\div 4 + 7 - 0\\).',
      steps: [
        'Primeiro multiplicações e divisões: \\(9 \\times 0 = 0\\) e \\(0 \\div 4 = 0\\).',
        'A conta fica \\(0 + 0 + 7 - 0\\).',
        'Somar ou tirar zero não muda nada: o resultado é \\(7\\).',
      ],
    },
    {
      problem: 'Quanto é \\(12 \\div 0\\)?',
      steps: [
        'Dividir é desfazer a multiplicação: precisamos de um número que, vezes \\(0\\), dê \\(12\\).',
        'Mas qualquer número vezes \\(0\\) dá \\(0\\). Nenhum dá \\(12\\).',
        'Logo, \\(12 \\div 0\\) não existe: não se divide por zero.',
      ],
    },
  ],
};

export default meta;
