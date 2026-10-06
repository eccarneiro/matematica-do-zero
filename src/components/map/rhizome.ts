// Grafo do rizoma (aulas + ramos + conexões) e o layout orgânico do mapa.
// Funções puras e determinísticas: o mesmo conteúdo gera sempre o mesmo mapa.

import { forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY, type SimulationLinkDatum, type SimulationNodeDatum } from 'd3-force';
import type { BranchRef, CourseModule } from '@/content/types';

export type RhizomeNode =
  | { id: string; type: 'lesson'; title: string; symbol: string; moduleId: string; color: string; order: number; ready: boolean; chapter: number; step: number }
  | { id: string; type: 'branch'; title: string; kind: BranchRef['kind']; ready: boolean };

export interface RhizomeEdge {
  id: string;
  source: string;
  target: string;
  /** tronco = caminho recomendado; ramo = aula → ramo; conexao = ligação lateral */
  kind: 'tronco' | 'ramo' | 'conexao';
}

export function buildRhizome(curriculum: CourseModule[], branches: BranchRef[]) {
  const nodes: RhizomeNode[] = [];
  const edges: RhizomeEdge[] = [];
  let order = 0;
  let prev: string | null = null;

  for (const [chapter, m] of curriculum.entries()) {
    for (const [step, l] of m.lessons.entries()) {
      order += 1;
      nodes.push({ id: l.id, type: 'lesson', title: l.title, symbol: l.symbol, moduleId: m.id, color: m.color, order, ready: !!l.ready, chapter, step });
      if (prev) edges.push({ id: `t:${prev}:${l.id}`, source: prev, target: l.id, kind: 'tronco' });
      prev = l.id;
    }
  }

  const seen = new Set(edges.map((e) => [e.source, e.target].sort().join('|')));
  const add = (a: string, b: string, kind: RhizomeEdge['kind']) => {
    const key = [a, b].sort().join('|');
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ id: `${kind[0]}:${a}:${b}`, source: a, target: b, kind });
  };

  for (const b of branches) {
    nodes.push({ id: b.id, type: 'branch', title: b.title, kind: b.kind, ready: !!b.ready });
    for (const f of b.from) add(f, b.id, 'ramo');
  }
  for (const b of branches) for (const l of b.links) add(b.id, l, 'conexao');

  return { nodes, edges };
}

type SimNode = SimulationNodeDatum & { id: string; type: RhizomeNode['type']; fy0: number; fx0: number };

/** Espaço vertical por aula e horizontal por capítulo: a "correnteza" que mantém o caminho legível. */
const FLOW = 150;
const LANE = 720;

/**
 * Layout por forças (d3-force), rodado de forma síncrona e determinística:
 * posições iniciais numa espiral (sem aleatoriedade) e número fixo de passos.
 */
export function layoutRhizome(graph: ReturnType<typeof buildRhizome>, ticks = 400): Record<string, { x: number; y: number }> {
  // Posições iniciais sem aleatoriedade: aulas descendo em zigue-zague, ramos ao lado da aula de origem.
  // Cada capítulo desce na sua própria faixa, lado a lado; os ramos começam perto da aula de origem.
  const lessons = new Map(graph.nodes.flatMap((n) => (n.type === 'lesson' ? [[n.id, n] as const] : [])));
  const parent = new Map(graph.edges.filter((e) => e.kind === 'ramo').map((e) => [e.target, e.source]));
  const lanes = Math.max(...[...lessons.values()].map((l) => l.chapter)) + 1;
  const rootLesson = (id: string, guard = 0): ReturnType<typeof lessons.get> => lessons.get(id) ?? (guard < 20 ? rootLesson(parent.get(id) ?? '', guard + 1) : undefined);
  const sim: SimNode[] = graph.nodes.map((n, i) => {
    const anchor = n.type === 'lesson' ? n : rootLesson(parent.get(n.id) ?? '')!;
    const fx0 = (anchor.chapter - (lanes - 1) / 2) * LANE;
    const fy0 = anchor.step * FLOW;
    const side = i % 2 ? 1 : -1;
    const x = n.type === 'lesson' ? fx0 + Math.sin(anchor.step) * 50 : fx0 + side * (200 + (i % 3) * 40);
    return { id: n.id, type: n.type, fx0, fy0, x, y: fy0 + (n.type === 'lesson' ? 0 : (i % 3) * 30) };
  });
  const links: (SimulationLinkDatum<SimNode> & { kind: RhizomeEdge['kind'] })[] = graph.edges.map((e) => ({ source: e.source, target: e.target, kind: e.kind }));

  const simulation = forceSimulation(sim)
    .force(
      'link',
      forceLink<SimNode, (typeof links)[number]>(links)
        .id((d) => d.id)
        .distance((l) => (l.kind === 'tronco' ? 150 : l.kind === 'ramo' ? 130 : 210))
        .strength((l) => (l.kind === 'tronco' ? 0.9 : l.kind === 'ramo' ? 0.6 : 0.12)),
    )
    .force('charge', forceManyBody<SimNode>().strength((d) => (d.type === 'lesson' ? -700 : -450)))
    .force('collide', forceCollide<SimNode>((d) => (d.type === 'lesson' ? 72 : 100)))
    // correnteza: as aulas descem na ordem do tronco; os ramos ficam livres em volta
    .force('flow', forceY<SimNode>((d) => d.fy0).strength((d) => (d.type === 'lesson' ? 0.35 : 0.04)))
    .force('lane', forceX<SimNode>((d) => d.fx0).strength((d) => (d.type === 'lesson' ? 0.25 : 0.05)))
    .stop();
  simulation.tick(ticks);

  return Object.fromEntries(sim.map((n) => [n.id, { x: Math.round(n.x ?? 0), y: Math.round(n.y ?? 0) }]));
}
