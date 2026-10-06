import { describe, expect, it } from 'vitest';
import { makeRng } from '@/lib/math/random';
import { generateFiltered } from '@/generators/filter';
import { loadGenerator, topicIds, type TopicId } from '@/generators/registry';
import type { Level } from '@/generators/types';
import { curriculum, legacyLessons } from './curriculum';

const all = curriculum.flatMap((m) => m.lessons);

describe('currículo', () => {
  it('ids únicos', () => {
    expect(new Set(all.map((l) => l.id)).size).toBe(all.length);
  });

  it('aulas antigas apontam para micro-aulas publicadas', () => {
    for (const [oldId, ids] of Object.entries(legacyLessons)) {
      expect(all.some((l) => l.id === oldId), `${oldId} não deveria mais existir`).toBe(false);
      for (const id of ids) expect(all.find((l) => l.id === id)?.ready, `${oldId} → ${id}`).toBe(true);
    }
  });

  it('seções contínuas: micro-aulas da mesma seção ficam juntas', () => {
    for (const m of curriculum) {
      const seq = m.lessons.map((l) => l.section).filter(Boolean);
      const seen = new Set<string>();
      seq.forEach((s, i) => {
        if (i > 0 && seq[i - 1] !== s) expect(seen.has(s!), `seção "${s}" aparece separada`).toBe(false);
        seen.add(s!);
      });
    }
  });

  describe.each(all.filter((l) => l.ready && l.topic && l.kinds))('micro-aula $id', (lesson) => {
    it('o treino gera só (e todos) os tipos de questão dela', async () => {
      expect(topicIds).toContain(lesson.topic);
      const gen = await loadGenerator(lesson.topic as TopicId);
      for (const level of [1, 2, 3] as Level[]) {
        const rng = makeRng(42 + level);
        const seen = new Set<string>();
        for (let i = 0; i < 120; i++) seen.add(generateFiltered(gen, level, rng, lesson.kinds).data.kind);
        for (const k of seen) expect(lesson.kinds).toContain(k);
      }
      // cada tipo pedido aparece em algum nível
      const rng = makeRng(7);
      const anyLevel = new Set<string>();
      for (const level of [1, 2, 3] as Level[]) for (let i = 0; i < 200; i++) anyLevel.add(generateFiltered(gen, level, rng, lesson.kinds).data.kind);
      for (const k of lesson.kinds!) expect(anyLevel.has(k), `tipo ${k} nunca aparece`).toBe(true);
    });
  });
});
