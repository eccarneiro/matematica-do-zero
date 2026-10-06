import type { ExpectedAnswer } from '@/lib/math/answer';
import type { Rng } from '@/lib/math/random';

export type Level = 1 | 2 | 3;

export const LEVEL_NAMES: Record<Level, string> = { 1: 'Fácil', 2: 'Médio', 3: 'Difícil' };

/** Teclas extras do teclado auxiliar (o teclado numérico do celular não tem todas). */
export type Key = '-' | '/' | ',' | '√' | '%';

/**
 * Uma questão gerada. Textos aceitam HTML simples e fórmulas entre \( \) ou \[ \].
 */
export interface Question {
  prompt: string;
  /** SVG com a figura da questão (medidas sorteadas). */
  figure?: string;
  answer: ExpectedAnswer;
  /** Resposta como alguém digitaria; os testes conferem que ela é aceita. */
  answerText?: string;
  /** Resposta correta formatada para exibição. */
  answerDisplay: string;
  /** Dica mostrada no primeiro erro. */
  hint: string;
  /** Resolução passo a passo desta questão específica. */
  steps: string[];
  keys?: Key[];
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  /** Dados brutos usados pelos testes para recalcular a resposta de forma independente. */
  data: Record<string, unknown> & { kind: string };
}

export interface Generator {
  id: string;
  title: string;
  generate(level: Level, rng: Rng): Question;
}
