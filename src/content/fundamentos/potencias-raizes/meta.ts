import type { LessonMeta } from '@/content/types';

const meta: LessonMeta = {
  history: {
    title: 'Da diagonal babilônica à areia de Arquimedes',
    when: 'c. 1800–1600 a.C. · séc. III a.C. · 1525 · 1637',
    where: 'Mesopotâmia, Grécia, Sicília e Europa',
    who: 'Escribas babilônios, pitagóricos, Arquimedes, Christoff Rudolff, René Descartes',
  },
  uses: [
    { icon: '🔬', title: 'Ciência em notação científica', text: 'Um glóbulo vermelho mede cerca de \\(7 \\times 10^{-6}\\) m; a distância da Terra ao Sol é cerca de \\(1{,}5 \\times 10^{11}\\) m. Potências de 10 deixam números gigantes e minúsculos legíveis.' },
    { icon: '💾', title: 'Memória e senhas', text: 'Cada bit é 0 ou 1, então 8 bits formam \\(2^8 = 256\\) combinações. Uma senha de 4 dígitos tem \\(10^4 = 10\\,000\\) possibilidades; com 6 dígitos, \\(10^6\\): um milhão.' },
    { icon: '📺', title: 'Polegadas da TV', text: 'O tamanho da tela é a diagonal, calculada com raiz quadrada: \\(\\sqrt{\\text{largura}^2 + \\text{altura}^2}\\). É a mesma diagonal do quadrado que os babilônios estudavam.' },
    { icon: '🦠', title: 'Coisas que dobram', text: 'Uma bactéria que se divide a cada 20 minutos vira \\(2^{3} = 8\\) em uma hora e \\(2^{30}\\), mais de um bilhão, em 10 horas. Juros compostos e epidemias crescem do mesmo jeito.' },
    { icon: '📐', title: 'Metro quadrado', text: 'Um terreno de \\(400\\text{ m}^2\\) quadrado tem lado \\(\\sqrt{400} = 20\\) m. O "ao quadrado" do \\(\\text{m}^2\\) é exatamente a potência desta aula.' },
  ],
  think: {
    question: 'A matemática foi inventada ou descoberta?',
    text: 'Desenhe um quadrado de lado 1: a diagonal existe, você pode medi-la com uma régua. Mas o número \\(\\sqrt{2}\\) não pode ser escrito como fração nenhuma, e seus decimais nunca se repetem. Os pitagóricos não inventaram isso: deram de cara com o fato, e ele os incomodou. Por outro lado, o símbolo \\(\\sqrt{\\ }\\) e o expoente pequeno foram criados por pessoas. O que é invenção e o que é descoberta numa ideia como \\(\\sqrt{2}\\)?',
  },
  videos: [
    { id: '4Vfw1XiHTpM', title: 'Potenciação: definição e propriedades', channel: 'Professor Ferretto' },
    { id: 'i7bCpeTMgTU', title: 'Raiz quadrada', channel: 'Gis com Giz' },
  ],
  examples: [
    {
      problem: 'Calcule \\((-2)^4\\) e \\(-2^4\\). Dá a mesma coisa?',
      steps: [
        'Com parênteses, a base é \\(-2\\): \\((-2)^4 = (-2)\\cdot(-2)\\cdot(-2)\\cdot(-2) = 16\\). Quatro sinais de menos se cancelam aos pares.',
        'Sem parênteses, o expoente vale só para o 2: \\(-2^4 = -(2\\cdot 2\\cdot 2\\cdot 2) = -16\\).',
        'Não dá a mesma coisa: \\((-2)^4 = 16\\) e \\(-2^4 = -16\\).',
      ],
    },
    {
      problem: 'Quanto vale \\(2^{-3}\\)?',
      steps: [
        'Siga o padrão, dividindo por 2 a cada passo: \\(2^2 = 4\\), \\(2^1 = 2\\), \\(2^0 = 1\\), \\(2^{-1} = \\tfrac{1}{2}\\), \\(2^{-2} = \\tfrac{1}{4}\\).',
        'Mais um passo: \\(2^{-3} = \\tfrac{1}{8}\\).',
        'Regra geral: \\(a^{-n} = \\dfrac{1}{a^n}\\), então \\(2^{-3} = \\dfrac{1}{2^3} = \\dfrac{1}{8}\\).',
      ],
    },
    {
      problem: 'Simplifique \\(\\sqrt{72}\\).',
      steps: [
        'Procure o maior quadrado perfeito que divide 72: \\(72 = 36 \\cdot 2\\).',
        'A raiz de um produto é o produto das raízes: \\(\\sqrt{72} = \\sqrt{36}\\cdot\\sqrt{2} = 6\\sqrt{2}\\).',
        'O 2 não tem fator quadrado, então \\(6\\sqrt{2}\\) é a forma mais simples (\\(\\approx 8{,}49\\)).',
      ],
    },
    {
      problem: 'Escreva \\(\\dfrac{5^3 \\cdot 5^6}{5^7}\\) como uma só potência e calcule.',
      steps: [
        'Multiplicação de mesma base: some os expoentes. \\(5^3 \\cdot 5^6 = 5^{9}\\).',
        'Divisão de mesma base: subtraia. \\(5^9 \\div 5^7 = 5^{2}\\).',
        'Resultado: \\(5^2 = 25\\). Sem as propriedades, seria preciso calcular \\(5^9 = 1\\,953\\,125\\)!',
      ],
    },
  ],
};

export default meta;
