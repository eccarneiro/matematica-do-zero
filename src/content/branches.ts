import type { ComponentType } from 'react';
import type { BranchContent, BranchKind, BranchMeta, BranchRef } from './types';

// Ramos laterais do rizoma (issue #5). Cada ramo sai de uma ou mais aulas do
// tronco (`from`) e se liga a outras aulas ou ramos (`links`), inclusive de
// outros capítulos. O conteúdo de um ramo publicado fica em src/content/ramos/<id>/.

export const BRANCH_KINDS: Record<BranchKind, { label: string; icon: string; color: string }> = {
  aprofundar: { label: 'Aprofundar', icon: '🔬', color: 'indigo' },
  culturas: { label: 'Outras culturas', icon: '🌍', color: 'teal' },
  filosofia: { label: 'Filosofia', icon: '💭', color: 'violet' },
  conexao: { label: 'Conexões', icon: '🔗', color: 'amber' },
  desafio: { label: 'Desafio', icon: '🧩', color: 'rose' },
};

export const branches: BranchRef[] = [
  // Números naturais e inteiros
  {
    id: 'contar-sem-numeros', kind: 'culturas', ready: true,
    title: 'Contar sem números: riscos, pedrinhas e nós',
    summary: 'Antes dos algarismos, contar era fazer corresponder: uma marca para cada coisa.',
    from: ['numeros-inteiros'], links: ['o-zero-e-natural', 'zero-maia'],
  },
  {
    id: 'o-zero-e-natural', kind: 'filosofia', ready: true,
    title: 'O 0 é natural? E o 1 é número?',
    summary: 'Por que os naturais começavam no 1 e hoje muitas vezes começam no 0.',
    from: ['numeros-inteiros'], links: ['zero', 'contar-sem-numeros', 'dividir-por-zero'],
  },
  // As quatro operações
  {
    id: 'multiplicacao-egipcia', kind: 'aprofundar', ready: true,
    title: 'Multiplicar como os egípcios',
    summary: 'Dobrar e somar: o método do papiro de Rhind ainda funciona hoje.',
    from: ['operacoes'], links: ['fracoes-egipcias', 'lenda-xadrez'],
  },
  {
    id: 'quatro-quatros', kind: 'desafio', ready: true,
    title: 'O desafio dos quatro 4',
    summary: 'Escreva cada número usando exatamente quatro algarismos 4.',
    from: ['operacoes'], links: ['potencias-raizes', 'fracoes'],
  },
  // O zero
  {
    id: 'zero-maia', kind: 'culturas', ready: true,
    title: 'O zero dos maias',
    summary: 'Do outro lado do oceano, outro povo inventou um zero sozinho.',
    from: ['zero'], links: ['contar-sem-numeros'],
  },
  {
    id: 'dividir-por-zero', kind: 'aprofundar', ready: true,
    title: 'Por que não se divide por zero',
    summary: 'A divisão desfaz a multiplicação, e é aí que o zero trava tudo.',
    from: ['zero'], links: ['o-zero-e-natural', 'zero-virgula-nove', 'limites'],
  },
  // Frações
  {
    id: 'fracoes-egipcias', kind: 'aprofundar', ready: true,
    title: 'Frações egípcias: tudo com numerador 1',
    summary: 'Como escrever qualquer fração como soma de frações unitárias.',
    from: ['fracoes'], links: ['multiplicacao-egipcia', 'decimais'],
  },
  {
    id: 'fracoes-musica', kind: 'conexao', ready: true,
    title: 'Frações que soam bem: a música dos pitagóricos',
    summary: 'Oitava, quinta e quarta são razões simples: 2/1, 3/2 e 4/3.',
    from: ['fracoes'], links: ['raiz-de-dois', 'potencias-raizes'],
  },
  // Números decimais
  {
    id: 'zero-virgula-nove', kind: 'filosofia', ready: true,
    title: '0,999… é igual a 1?',
    summary: 'Uma igualdade que parece errada e diz muito sobre o infinito.',
    from: ['decimais'], links: ['dividir-por-zero', 'limites'],
  },
  {
    id: 'metro', kind: 'culturas', ready: true,
    title: 'Como nasceu o metro',
    summary: 'A Revolução Francesa quis uma medida para todos os povos.',
    from: ['decimais'], links: ['zero-virgula-nove'],
  },
  // Porcentagem
  {
    id: 'juros-compostos', kind: 'conexao', ready: true,
    title: 'Juros compostos: a bola de neve',
    summary: 'Porcentagem sobre porcentagem vira crescimento exponencial.',
    from: ['porcentagem'], links: ['lenda-xadrez', 'porcentagens-enganam', 'funcao-exponencial'],
  },
  {
    id: 'porcentagens-enganam', kind: 'desafio', ready: true,
    title: 'Porcentagens que enganam',
    summary: 'Pontos percentuais, bases diferentes e manchetes traiçoeiras.',
    from: ['porcentagem'], links: ['juros-compostos', 'fracoes'],
  },
  // Potências e raízes
  {
    id: 'lenda-xadrez', kind: 'desafio', ready: true,
    title: 'A lenda do xadrez e os grãos de trigo',
    summary: 'Um grão na primeira casa, dois na segunda… quanto dá no fim?',
    from: ['potencias-raizes'], links: ['juros-compostos', 'multiplicacao-egipcia'],
  },
  {
    id: 'raiz-de-dois', kind: 'aprofundar', ready: true,
    title: '√2 não é uma fração',
    summary: 'A demonstração que abalou os pitagóricos, passo a passo.',
    from: ['potencias-raizes'], links: ['fracoes-musica', 'pitagoras'],
  },
];

type Loader<T> = () => Promise<{ default: T }>;

function branch(meta: Loader<BranchMeta>, body: Loader<ComponentType>) {
  return async (): Promise<BranchContent> => {
    const [m, b] = await Promise.all([meta(), body()]);
    return { meta: m.default, Body: b.default };
  };
}

// Conteúdo dos ramos publicados (importações explícitas para o bundler).
const loaders: Record<string, () => Promise<BranchContent>> = {
  'contar-sem-numeros': branch(() => import('./ramos/contar-sem-numeros/meta'), () => import('./ramos/contar-sem-numeros/texto.mdx')),
  'o-zero-e-natural': branch(() => import('./ramos/o-zero-e-natural/meta'), () => import('./ramos/o-zero-e-natural/texto.mdx')),
  'multiplicacao-egipcia': branch(() => import('./ramos/multiplicacao-egipcia/meta'), () => import('./ramos/multiplicacao-egipcia/texto.mdx')),
  'quatro-quatros': branch(() => import('./ramos/quatro-quatros/meta'), () => import('./ramos/quatro-quatros/texto.mdx')),
  'zero-maia': branch(() => import('./ramos/zero-maia/meta'), () => import('./ramos/zero-maia/texto.mdx')),
  'dividir-por-zero': branch(() => import('./ramos/dividir-por-zero/meta'), () => import('./ramos/dividir-por-zero/texto.mdx')),
  'juros-compostos': branch(() => import('./ramos/juros-compostos/meta'), () => import('./ramos/juros-compostos/texto.mdx')),
  'porcentagens-enganam': branch(() => import('./ramos/porcentagens-enganam/meta'), () => import('./ramos/porcentagens-enganam/texto.mdx')),
  'lenda-xadrez': branch(() => import('./ramos/lenda-xadrez/meta'), () => import('./ramos/lenda-xadrez/texto.mdx')),
  'raiz-de-dois': branch(() => import('./ramos/raiz-de-dois/meta'), () => import('./ramos/raiz-de-dois/texto.mdx')),
  'fracoes-egipcias': branch(() => import('./ramos/fracoes-egipcias/meta'), () => import('./ramos/fracoes-egipcias/texto.mdx')),
  'fracoes-musica': branch(() => import('./ramos/fracoes-musica/meta'), () => import('./ramos/fracoes-musica/texto.mdx')),
  'zero-virgula-nove': branch(() => import('./ramos/zero-virgula-nove/meta'), () => import('./ramos/zero-virgula-nove/texto.mdx')),
  'metro': branch(() => import('./ramos/metro/meta'), () => import('./ramos/metro/texto.mdx')),
};

export function findBranch(id: string): BranchRef | undefined {
  return branches.find((b) => b.id === id);
}

export function branchesFrom(lessonId: string): BranchRef[] {
  return branches.filter((b) => b.from.includes(lessonId));
}

export function hasBranchContent(id: string): boolean {
  return id in loaders;
}

export async function getBranchContent(id: string): Promise<BranchContent | undefined> {
  return loaders[id]?.();
}

/** Chave do ramo no progresso (fica junto das aulas, com prefixo). */
export const branchKey = (id: string) => `ramo-${id}`;
