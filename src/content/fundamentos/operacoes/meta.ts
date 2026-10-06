import type { LessonMeta } from '@/content/types';

const meta: LessonMeta = {
  history: {
    title: 'De tabletes de argila aos sinais + − × ÷',
    when: 'c. 1800 a.C. · 1489 · 1557 · 1631 · 1659',
    where: 'Mesopotâmia, Egito e Europa',
    who: 'Escribas babilônios, Ahmes, Widmann, Recorde, Oughtred, Rahn',
  },
  uses: [
    { icon: '🛒', title: 'Compras e troco', text: 'Somar os itens do carrinho e calcular o troco: pagar com \\(\\text{R\\$}\\,50\\) uma compra de \\(\\text{R\\$}\\,37\\) dá \\(50 - 37 = 13\\) de troco.' },
    { icon: '🍕', title: 'Dividir a conta', text: 'Uma pizza de \\(\\text{R\\$}\\,72\\) entre 4 amigos: \\(72 \\div 4 = 18\\) para cada um. A divisão reparte em partes iguais.' },
    { icon: '🧱', title: 'Obras e reformas', text: 'Um piso de 4 m por 6 m tem \\(4 \\times 6 = 24\\) metros quadrados: a multiplicação como área diz quantas caixas de piso comprar.' },
    { icon: '📊', title: 'Planilhas', text: 'No Excel ou no Google Planilhas, a fórmula <code>=2+3*4</code> dá 14, não 20: o computador segue a mesma ordem das operações que você.' },
    { icon: '🚌', title: 'Logística', text: 'Quantos ônibus de 44 lugares levam 150 pessoas? \\(150 = 44 \\times 3 + 18\\): 3 ônibus lotam e o resto exige um quarto ônibus.' },
  ],
  think: {
    question: 'A ordem das operações é uma verdade ou um combinado?',
    text: 'Que \\(3 \\times 4 = 12\\) ninguém escolheu: é verdade em qualquer lugar do universo. Mas que \\(2 + 3 \\times 4\\) vale 14, e não 20, foi um acordo, como dirigir do lado direito da rua. Se outra civilização tivesse combinado o contrário, a matemática dela estaria errada, ou só escrita de outro jeito? Onde termina a descoberta e começa a convenção?',
  },
  videos: [
    { id: 'e78_5WIssSU', title: 'Adição e subtração: aprenda matemática do zero', channel: 'Professor Ferretto' },
    { id: 'BhDm2qGy780', title: 'Expressões numéricas: ordem nas operações', channel: 'Professor Ferretto' },
  ],
  examples: [
    {
      problem: 'Calcule \\(503 - 268\\).',
      steps: [
        'Unidades: 3 é menor que 8. A dezena vizinha é 0 e não tem o que emprestar, então pegamos 1 centena: o 5 vira 4 e a casa das dezenas vira 10.',
        'Agora a dezena empresta 1 para as unidades: ela fica 9, e as unidades ficam 13. \\(13 - 8 = 5\\).',
        'Dezenas: \\(9 - 6 = 3\\). Centenas: \\(4 - 2 = 2\\).',
        'Resultado: \\(235\\). Confira somando: \\(235 + 268 = 503\\).',
      ],
    },
    {
      problem: 'Calcule \\(36 \\times 14\\).',
      steps: [
        'Quebre o 14 em \\(10 + 4\\) e multiplique por partes.',
        '\\(36 \\times 10 = 360\\) e \\(36 \\times 4 = 144\\).',
        'Some: \\(360 + 144 = 504\\). É a área de um retângulo de 36 por 14, cortado em dois pedaços.',
      ],
    },
    {
      problem: 'Divida \\(47\\) por \\(6\\): qual é o quociente e o resto?',
      steps: [
        'Tabuada do 6: \\(6 \\times 7 = 42\\) e \\(6 \\times 8 = 48\\). O 48 já passa de 47.',
        'Quociente \\(7\\). Resto: \\(47 - 42 = 5\\), que é menor que 6, como deve ser.',
        'Confira: \\(6 \\times 7 + 5 = 47\\).',
      ],
    },
    {
      problem: 'Calcule \\(40 - 2 \\times (3 + 5) \\div 4\\).',
      steps: [
        'Parênteses primeiro: \\(3 + 5 = 8\\). Fica \\(40 - 2 \\times 8 \\div 4\\).',
        'Multiplicação e divisão, da esquerda para a direita: \\(2 \\times 8 = 16\\), depois \\(16 \\div 4 = 4\\).',
        'Por fim a subtração: \\(40 - 4 = 36\\).',
      ],
    },
  ],
};

export default meta;
