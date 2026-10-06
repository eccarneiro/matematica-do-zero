import type { Rng } from '@/lib/math/random';
import type { Generator, Level, Question } from './types';

const TRIES_PER_LEVEL = 80;

/**
 * Gera uma questão só dos tipos pedidos (micro-aula). Tenta primeiro no nível
 * do aluno e, se aquele tipo não existir nesse nível, nos níveis vizinhos.
 */
export function generateFiltered(gen: Generator, level: Level, rng: Rng, kinds?: readonly string[]): Question {
  if (!kinds?.length) return gen.generate(level, rng);
  const levels = ([1, 2, 3] as Level[]).sort((a, b) => Math.abs(a - level) - Math.abs(b - level));
  for (const l of levels) {
    for (let i = 0; i < TRIES_PER_LEVEL; i++) {
      const q = gen.generate(l, rng);
      if (kinds.includes(q.data.kind)) return q;
    }
  }
  throw new Error(`O gerador "${gen.id}" não produziu nenhum dos tipos ${kinds.join(', ')}.`);
}
