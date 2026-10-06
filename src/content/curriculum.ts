import type { CourseModule, LessonRef } from './types';

// Trilha completa do curso. Uma aula publicada tem `ready: true`, uma pasta em
// src/content/<modulo>/<aula>/ e um gerador em src/generators/.

export const curriculum: CourseModule[] = [
  {
    id: 'fundamentos',
    number: 1,
    title: 'Fundamentos',
    tagline: 'Os números e as operações que sustentam todo o resto.',
    color: 'coral',
    lessons: [
      { id: 'numeros-inteiros', title: 'Números naturais e inteiros', topic: 'inteiros', ready: true,
        summary: 'Contar, ordenar e ir além do zero com os negativos.',
        keywords: 'naturais inteiros negativos reta numérica sinais soma subtração comparar oposto módulo' },
      { id: 'operacoes', topic: 'operacoes', ready: true, title: 'As quatro operações',
        summary: 'Somar, subtrair, multiplicar, dividir e a ordem certa de fazer as contas.',
        keywords: 'adição subtração multiplicação divisão resto expressões numéricas ordem das operações parênteses tabuada' },
      { id: 'zero', topic: 'zero', ready: true, title: 'O zero',
        summary: 'O número que é “nada” e mudou a matemática para sempre.',
        keywords: 'zero valor posicional sistema decimal algarismos indo-arábico divisão por zero Brahmagupta' },
      { id: 'fracoes', topic: 'fracoes', ready: true, title: 'Frações',
        summary: 'Partes de um todo: dividir, comparar e operar.',
        keywords: 'frações numerador denominador equivalentes simplificar soma mmc pizza egito' },
      { id: 'decimais', title: 'Números decimais',
        summary: 'A vírgula que conecta frações, dinheiro e medidas.',
        keywords: 'decimais vírgula décimos centésimos dinheiro Stevin dízima' },
      { id: 'porcentagem', title: 'Porcentagem',
        summary: 'Uma fração com denominador 100 que está em todo lugar.',
        keywords: 'porcentagem por cento desconto aumento juros taxa' },
      { id: 'potencias-raizes', title: 'Potências e raízes',
        summary: 'Multiplicações repetidas e o caminho de volta.',
        keywords: 'potência expoente base raiz quadrada cúbica radiciação notação científica' },
    ],
  },
  {
    id: 'algebra',
    number: 2,
    title: 'Álgebra',
    tagline: 'Letras no lugar de números para resolver problemas de qualquer tamanho.',
    color: 'violet',
    lessons: [
      { id: 'expressoes', title: 'Expressões algébricas', keywords: 'variável incógnita expressão algébrica' },
      { id: 'equacoes-1-grau', title: 'Equações do 1º grau', keywords: 'equação primeiro grau balança al-khwarizmi algoritmo' },
      { id: 'equacoes-2-grau', title: 'Equações do 2º grau', keywords: 'equação segundo grau bhaskara raízes delta' },
      { id: 'sistemas', title: 'Sistemas de equações', keywords: 'sistema substituição adição duas incógnitas' },
      { id: 'inequacoes', title: 'Inequações', keywords: 'inequação desigualdade maior menor intervalo' },
    ],
  },
  {
    id: 'funcoes',
    number: 3,
    title: 'Funções',
    tagline: 'Como uma coisa depende da outra, em gráficos que contam histórias.',
    color: 'teal',
    lessons: [
      { id: 'conceito-funcao', title: 'O que é uma função', keywords: 'função domínio imagem relação' },
      { id: 'graficos', title: 'Gráficos e o plano cartesiano', keywords: 'gráfico plano cartesiano descartes eixo coordenadas' },
      { id: 'funcao-afim', title: 'Função afim', keywords: 'função afim primeiro grau reta coeficiente angular' },
      { id: 'funcao-quadratica', title: 'Função quadrática', keywords: 'função quadrática parábola vértice' },
      { id: 'funcao-exponencial', title: 'Função exponencial', keywords: 'exponencial crescimento juros compostos' },
      { id: 'funcao-logaritmica', title: 'Função logarítmica', keywords: 'logaritmo napier escala' },
    ],
  },
  {
    id: 'geometria',
    number: 4,
    title: 'Geometria',
    tagline: 'Formas, medidas e o espaço ao nosso redor.',
    color: 'amber',
    lessons: [
      { id: 'angulos', title: 'Ângulos', keywords: 'ângulo graus transferidor reto agudo obtuso' },
      { id: 'triangulos', title: 'Triângulos', keywords: 'triângulo soma dos ângulos semelhança' },
      { id: 'pitagoras', title: 'Teorema de Pitágoras', keywords: 'pitágoras hipotenusa cateto triângulo retângulo' },
      { id: 'areas', title: 'Áreas', keywords: 'área retângulo triângulo trapézio' },
      { id: 'circulo', title: 'O círculo', keywords: 'círculo circunferência pi raio diâmetro arquimedes' },
      { id: 'volumes', title: 'Volumes', keywords: 'volume cubo prisma cilindro esfera' },
      { id: 'trigonometria', title: 'Trigonometria', keywords: 'trigonometria seno cosseno tangente' },
    ],
  },
  {
    id: 'calculo',
    number: 5,
    title: 'Cálculo',
    tagline: 'A matemática da mudança: intuição primeiro, fórmula depois.',
    color: 'blue',
    lessons: [
      { id: 'limites', title: 'Limites', keywords: 'limite tender infinito zenão' },
      { id: 'derivadas', title: 'Derivadas', keywords: 'derivada taxa de variação reta tangente newton leibniz velocidade' },
      { id: 'integrais', title: 'Integrais', keywords: 'integral área sob a curva soma de riemann arquimedes' },
    ],
  },
];

export function getModule(moduleId: string): CourseModule | undefined {
  return curriculum.find((m) => m.id === moduleId);
}

export function findLesson(lessonId: string) {
  for (const mod of curriculum) {
    const index = mod.lessons.findIndex((l) => l.id === lessonId);
    if (index >= 0) return { module: mod, lesson: mod.lessons[index], index };
  }
  return undefined;
}

/** Aulas publicadas que têm treino infinito. */
export function practiceLessons(): { module: CourseModule; lesson: LessonRef & { topic: NonNullable<LessonRef['topic']> } }[] {
  return curriculum.flatMap((module) =>
    module.lessons
      .filter((l): l is LessonRef & { topic: NonNullable<LessonRef['topic']> } => !!l.ready && !!l.topic)
      .map((lesson) => ({ module, lesson })),
  );
}
