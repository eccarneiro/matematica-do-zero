import { describe, expect, it } from 'vitest';
import katex from 'katex';
import { checkAnswer } from '@/lib/math/answer';
import { READING_KINDS } from './types';
import { branches, hasBranchContent } from './branches';
import { curriculum } from './curriculum';

// O conteúdo MDX não é importável no Vitest; os dados (meta.ts) são.
const metas = import.meta.glob('./ramos/*/meta.ts', { eager: true }) as Record<string, { default: import('./types').BranchMeta }>;
const metaOf = (id: string) => metas[`./ramos/${id}/meta.ts`]?.default;

const lessonIds = new Set(curriculum.flatMap((m) => m.lessons.map((l) => l.id)));
const branchIds = new Set(branches.map((b) => b.id));

function assertValidTex(text: string) {
  for (const m of text.matchAll(/\\\((.+?)\\\)|\\\[(.+?)\\\]/gs)) {
    expect(() => katex.renderToString(m[1] ?? m[2], { throwOnError: true })).not.toThrow();
  }
}

describe('rizoma', () => {
  it('ids únicos, válidos e sem colidir com aulas', () => {
    expect(branchIds.size).toBe(branches.length);
    for (const b of branches) {
      expect(b.id).toMatch(/^[a-z0-9-]{1,58}$/); // cabe em "ramo-<id>" no progresso
      expect(lessonIds.has(b.id), b.id).toBe(false);
    }
  });

  it('toda origem é uma aula ou outro ramo, e toda conexão existe (sem ligação quebrada)', () => {
    for (const b of branches) {
      expect(b.from.length, b.id).toBeGreaterThan(0);
      for (const f of b.from) expect(lessonIds.has(f) || branchIds.has(f), `${b.id} → from ${f}`).toBe(true);
      for (const l of b.links) {
        expect(lessonIds.has(l) || branchIds.has(l), `${b.id} → link ${l}`).toBe(true);
        expect(l, `${b.id} liga a si mesmo`).not.toBe(b.id);
      }
    }
  });

  it('ramos de ramos não formam ciclo e todo ramo chega a uma aula', () => {
    const reachesLesson = (id: string, path: string[]): boolean => {
      expect(path, `ciclo: ${[...path, id].join(' → ')}`).not.toContain(id);
      if (lessonIds.has(id)) return true;
      return branches.find((b) => b.id === id)!.from.every((f) => reachesLesson(f, [...path, id]));
    };
    for (const b of branches) expect(reachesLesson(b.id, [])).toBe(true);
  });

  it('cada seção publicada do Módulo 1 tem pelo menos 2 ramos', () => {
    const sections = new Map<string, string[]>();
    for (const l of curriculum[0].lessons.filter((x) => x.ready)) {
      const key = l.section ?? l.id;
      sections.set(key, [...(sections.get(key) ?? []), l.id]);
    }
    for (const [section, ids] of sections) {
      expect(branches.filter((b) => b.from.some((f) => ids.includes(f))).length, section).toBeGreaterThanOrEqual(2);
    }
  });

  describe.each(branches.filter((b) => b.ready))('ramo publicado $id', (b) => {
    const meta = metaOf(b.id);

    it('tem conteúdo e fontes', () => {
      expect(hasBranchContent(b.id)).toBe(true);
      expect(meta, 'meta.ts ausente').toBeDefined();
      expect(meta!.sources.length).toBeGreaterThanOrEqual(2);
      for (const s of meta!.sources) {
        expect(s.title && s.author).toBeTruthy();
        if (s.url) expect(s.url).toMatch(/^https:\/\//);
      }
    });

    it('exercícios conforme o tipo, com respostas aceitas e LaTeX válido', () => {
      const quiz = meta!.quiz ?? [];
      if (READING_KINDS.includes(b.kind)) return;
      expect(quiz.length, 'ramos de aprofundar/desafio precisam de exercícios').toBeGreaterThanOrEqual(2);
      for (const q of quiz) {
        [q.prompt, q.explanation, ...(q.answer.type === 'choice' ? q.answer.options : [])].forEach(assertValidTex);
        if (q.answer.type === 'choice') {
          expect(q.answer.correct).toBeLessThan(q.answer.options.length);
        } else {
          expect(q.answerText, q.prompt).toBeDefined();
          expect(checkAnswer(q.answer, q.answerText!).status, q.prompt).toBe('right');
        }
      }
    });
  });
});
