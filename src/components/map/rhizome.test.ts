import { describe, expect, it } from 'vitest';
import { branches } from '@/content/branches';
import { curriculum } from '@/content/curriculum';
import { buildRhizome, layoutRhizome } from './rhizome';

describe('grafo do rizoma', () => {
  const graph = buildRhizome(curriculum, branches);

  it('tem uma bolinha por aula e por ramo, e o tronco liga as aulas em ordem', () => {
    const lessons = curriculum.flatMap((m) => m.lessons);
    expect(graph.nodes).toHaveLength(lessons.length + branches.length);
    expect(graph.edges.filter((e) => e.kind === 'tronco')).toHaveLength(lessons.length - 1);
  });

  it('toda aresta liga nós existentes e não há arestas repetidas', () => {
    const ids = new Set(graph.nodes.map((n) => n.id));
    const keys = graph.edges.map((e) => [e.source, e.target].sort().join('|'));
    expect(new Set(keys).size).toBe(keys.length);
    for (const e of graph.edges) {
      expect(ids.has(e.source), e.id).toBe(true);
      expect(ids.has(e.target), e.id).toBe(true);
    }
  });

  it('layout determinístico e sem bolinhas sobrepostas', () => {
    const a = layoutRhizome(graph);
    const b = layoutRhizome(graph);
    expect(a).toEqual(b);
    const pts = Object.values(a);
    let minDist = Infinity;
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++) minDist = Math.min(minDist, Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y));
    expect(minDist).toBeGreaterThan(60);
  });
});
