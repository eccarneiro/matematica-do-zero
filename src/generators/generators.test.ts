import { describe, expect, it } from 'vitest';
import katex from 'katex';
import { checkAnswer } from '@/lib/math/answer';
import { makeRng } from '@/lib/math/random';
import { R, eq } from '@/lib/math/rational';
import { loadGenerator, topicIds } from './registry';
import type { Level, Question } from './types';

const PER_LEVEL = 400;
const LEVELS: Level[] = [1, 2, 3];

/** Resposta correta (como número) segundo a questão. */
function expectedValue(q: Question) {
  const a = q.answer;
  if (a.type === 'number') return a.value;
  throw new Error(`questão ${q.data.kind} não é numérica`);
}

/**
 * Verificadores independentes: recalculam a resposta a partir de q.data,
 * sem reaproveitar o código do gerador.
 */
const verifiers: Record<string, (q: Question) => void> = {
  sum(q) {
    const { signed, result } = q.data as unknown as { signed: number[]; result: number };
    expect(signed.reduce((s, x) => s + x, 0)).toBe(result);
    expect(eq(expectedValue(q), R(result))).toBe(true);
  },
  mul(q) {
    const { x, y, result } = q.data as unknown as { x: number; y: number; result: number };
    expect(x * y).toBe(result);
    expect(eq(expectedValue(q), R(result))).toBe(true);
  },
  div(q) {
    const { x, y, result } = q.data as unknown as { x: number; y: number; result: number };
    expect(y).not.toBe(0);
    expect(x / y).toBe(result);
    expect(Number.isInteger(result)).toBe(true);
    expect(eq(expectedValue(q), R(result))).toBe(true);
  },
  max(q) {
    const { values, result } = q.data as unknown as { values: number[]; result: number };
    expect(Math.max(...values)).toBe(result);
    const a = q.answer;
    if (a.type !== 'choice') throw new Error('esperava múltipla escolha');
    expect(a.options[a.correct]).toContain(String(result));
  },
};

/** Compila todo trecho \( \) e \[ \] com o KaTeX, falhando em LaTeX inválido. */
function assertValidTex(html: string) {
  const re = /\\\((.+?)\\\)|\\\[(.+?)\\\]/gs;
  for (const match of html.matchAll(re)) {
    const tex = match[1] ?? match[2];
    expect(() => katex.renderToString(tex, { throwOnError: true }), tex).not.toThrow();
  }
}

describe.each(topicIds)('gerador %s', (topic) => {
  it.each(LEVELS)('nível %i: respostas corretas, aceitas e bem formatadas', async (level) => {
    const gen = await loadGenerator(topic);
    const rng = makeRng(1000 * level + topic.length);
    const prompts = new Set<string>();
    for (let i = 0; i < PER_LEVEL; i++) {
      const q = gen.generate(level, rng);
      prompts.add(q.prompt);

      expect(q.prompt.length).toBeGreaterThan(0);
      expect(q.hint.length).toBeGreaterThan(0);
      expect(q.steps.length).toBeGreaterThan(0);
      expect(q.answerDisplay.length).toBeGreaterThan(0);

      const verify = verifiers[q.data.kind];
      expect(verify, `sem verificador para "${q.data.kind}"`).toBeDefined();
      verify(q);

      if (q.answer.type === 'choice') {
        expect(q.answer.correct).toBeGreaterThanOrEqual(0);
        expect(new Set(q.answer.options).size).toBe(q.answer.options.length);
      } else {
        expect(q.answerText, 'questões digitadas precisam de answerText').toBeDefined();
        const input = q.answer.type === 'fields' ? q.answerText!.split(';') : q.answerText!;
        expect(checkAnswer(q.answer, input).status, `${q.data.kind}: "${q.answerText}"`).toBe('right');
      }

      for (const text of [q.prompt, q.hint, q.answerDisplay, ...q.steps, ...(q.answer.type === 'choice' ? q.answer.options : [])]) {
        assertValidTex(text);
      }
    }
    // "Treino infinito": as questões precisam variar de verdade.
    expect(prompts.size).toBeGreaterThan(PER_LEVEL * 0.3);
  });
});
