import type { Generator } from './types';

// Cada tópico é carregado sob demanda, só quando o treino dele é aberto.
export const generatorLoaders = {
  naturais: () => import('./naturais'),
  inteiros: () => import('./inteiros'),
  operacoes: () => import('./operacoes'),
  zero: () => import('./zero'),
  fracoes: () => import('./fracoes'),
  decimais: () => import('./decimais'),
  porcentagem: () => import('./porcentagem'),
  potencias: () => import('./potencias'),
} satisfies Record<string, () => Promise<{ default: Generator }>>;

export type TopicId = keyof typeof generatorLoaders;

/** Nome de cada tópico de treino (o nível e o placar são guardados por tópico). */
export const TOPIC_TITLES: Record<TopicId, string> = {
  naturais: 'Números naturais',
  inteiros: 'Números inteiros',
  operacoes: 'As quatro operações',
  zero: 'Valor posicional e zero',
  fracoes: 'Frações',
  decimais: 'Números decimais',
  porcentagem: 'Porcentagem',
  potencias: 'Potências e raízes',
};

export const topicIds = Object.keys(generatorLoaders) as TopicId[];

export async function loadGenerator(id: TopicId): Promise<Generator> {
  return (await generatorLoaders[id]()).default;
}
