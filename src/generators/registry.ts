import type { Generator } from './types';

// Cada tópico é carregado sob demanda, só quando o treino dele é aberto.
export const generatorLoaders = {
  inteiros: () => import('./inteiros'),
  operacoes: () => import('./operacoes'),
  zero: () => import('./zero'),
} satisfies Record<string, () => Promise<{ default: Generator }>>;

export type TopicId = keyof typeof generatorLoaders;

export const topicIds = Object.keys(generatorLoaders) as TopicId[];

export async function loadGenerator(id: TopicId): Promise<Generator> {
  return (await generatorLoaders[id]()).default;
}
