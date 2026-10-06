'use client';

import '@xyflow/react/dist/style.css';
import {
  Background, Controls, Handle, Position, ReactFlow, ReactFlowProvider, useReactFlow,
  type Edge, type Node, type NodeProps,
} from '@xyflow/react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { BRANCH_KINDS, branchKey, branches } from '@/content/branches';
import { curriculum } from '@/content/curriculum';
import { useProgress } from '@/progress/store';
import { buildRhizome, layoutRhizome, type RhizomeNode } from './rhizome';

type State = 'done' | 'current' | 'open' | 'soon';
type LessonData = Extract<RhizomeNode, { type: 'lesson' }> & { state: State };
type BranchData = Extract<RhizomeNode, { type: 'branch' }> & { state: State };

// Arestas saem do centro de cada bolinha (layout orgânico, sem lado fixo).
const centerHandle = { top: '50%', left: '50%', opacity: 0, width: 1, height: 1, minWidth: 0, minHeight: 0, border: 0 } as const;
const Handles = () => (
  <>
    <Handle type="source" position={Position.Top} style={centerHandle} isConnectable={false} />
    <Handle type="target" position={Position.Top} style={centerHandle} isConnectable={false} />
  </>
);

function LessonNode({ data }: NodeProps<Node<LessonData>>) {
  const { state } = data;
  return (
    <div className={`c-${data.color} flex w-[120px] flex-col items-center text-center ${state === 'soon' ? 'opacity-50' : ''}`} title={data.title}>
      <Handles />
      <div
        className={`relative grid size-16 place-items-center rounded-full border-2 font-display text-[1.3rem] font-bold shadow-card ${
          state === 'done' ? 'border-accent bg-accent text-on-accent' : state === 'current' ? 'border-accent bg-surface text-accent ring-4 ring-accent/25' : 'border-dashed border-edge bg-surface text-ink-3'
        }`}
      >
        {data.symbol}
        <span className="absolute -top-1.5 -left-1.5 grid size-6 place-items-center rounded-full border border-line bg-surface text-[0.65rem] font-extrabold text-ink-2">{data.order}</span>
        {state === 'current' && <span className="absolute inset-0 animate-ping rounded-full border-2 border-accent opacity-30" />}
      </div>
      <span className="mt-1.5 line-clamp-2 rounded-md bg-bg/85 px-1.5 py-0.5 text-[0.72rem] leading-tight font-bold text-ink">{data.title}</span>
      {state === 'current' && <span className="mt-0.5 text-[0.6rem] font-extrabold tracking-wider text-accent uppercase">você está aqui</span>}
    </div>
  );
}

function BranchNode({ data }: NodeProps<Node<BranchData>>) {
  const k = BRANCH_KINDS[data.kind];
  const done = data.state === 'done';
  return (
    <div
      className={`c-${k.color} flex w-[168px] items-start gap-2 rounded-xl border px-2.5 py-2 text-left text-[0.72rem] leading-snug font-bold shadow-card ${
        !data.ready ? 'border-dashed border-edge bg-surface text-ink-3' : done ? 'border-accent bg-accent text-on-accent' : 'border-accent/40 bg-accent-soft text-ink'
      }`}
      title={`${k.label}: ${data.title}${data.ready ? '' : ' (em breve)'}`}
    >
      <Handles />
      <span aria-hidden className="text-[0.95rem] leading-none">{done ? '✓' : k.icon}</span>
      <span className="line-clamp-3">{data.title}</span>
    </div>
  );
}

const nodeTypes = { lesson: LessonNode, branch: BranchNode };

/** Tema atual (data-theme no <html>), acompanhando a troca claro/escuro. */
function useTheme(): 'light' | 'dark' {
  return useSyncExternalStore(
    (cb) => {
      const obs = new MutationObserver(cb);
      obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      return () => obs.disconnect();
    },
    () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'),
    () => 'light',
  );
}

function useRhizomeFlow() {
  const progress = useProgress();
  const graph = useMemo(() => buildRhizome(curriculum, branches), []);
  const positions = useMemo(() => layoutRhizome(graph), [graph]);

  return useMemo(() => {
    const isDone = (id: string) => !!progress.lessons[id]?.done;
    const current = graph.nodes.find((n) => n.type === 'lesson' && n.ready && !isDone(n.id))?.id;
    const stateOf = (n: RhizomeNode): State => {
      if (!n.ready) return 'soon';
      if (n.type === 'branch') return isDone(branchKey(n.id)) ? 'done' : 'open';
      return isDone(n.id) ? 'done' : n.id === current ? 'current' : 'open';
    };

    const nodes: Node[] = graph.nodes.map((n) => {
      const p = positions[n.id];
      const w = n.type === 'lesson' ? 120 : 168;
      return { id: n.id, type: n.type, position: { x: p.x - w / 2, y: p.y - 32 }, data: { ...n, state: stateOf(n) }, draggable: false, selectable: false };
    });

    const done = new Set(graph.nodes.filter((n) => stateOf(n) === 'done').map((n) => n.id));
    const edges: Edge[] = graph.edges.map((e) => {
      const walked = e.kind === 'tronco' && done.has(e.source) && (done.has(e.target) || e.target === current);
      const style =
        e.kind === 'tronco'
          ? { stroke: walked ? 'var(--indigo)' : 'var(--edge)', strokeWidth: 5 }
          : e.kind === 'ramo'
            ? { stroke: 'var(--edge)', strokeWidth: 2 }
            : { stroke: 'var(--ink-3)', strokeWidth: 1.5, strokeDasharray: '5 6', opacity: 0.55 };
      return { id: e.id, source: e.source, target: e.target, type: e.kind === 'tronco' ? 'default' : 'straight', style };
    });

    return { nodes, edges, current, graph, stateOf };
  }, [graph, positions, progress]);
}

function Flow() {
  const router = useRouter();
  const theme = useTheme();
  const { nodes, edges, current } = useRhizomeFlow();
  const flow = useReactFlow();

  const focusCurrent = useCallback(() => {
    const n = nodes.find((x) => x.id === current);
    if (n) flow.setCenter(n.position.x + 60, n.position.y + 40, { zoom: 0.95, duration: 600 });
    else flow.fitView({ duration: 600 });
  }, [nodes, current, flow]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      colorMode={theme}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      minZoom={0.15}
      maxZoom={1.6}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      onInit={() => setTimeout(focusCurrent, 50)}
      onNodeClick={(_, node) => {
        const d = node.data as RhizomeNode;
        if (!d.ready) return;
        router.push(d.type === 'lesson' ? `/aula/${d.id}` : `/ramo/${d.id}`);
      }}
      proOptions={{ hideAttribution: false }}
      style={{ background: 'var(--bg)' }}
    >
      <Background gap={28} size={1.4} color="var(--edge)" />
      <Controls showInteractive={false} position="bottom-right" />
      <div className="absolute top-2 right-2 z-10 flex gap-1.5 md:top-3 md:right-3 md:gap-2">
        <button type="button" onClick={focusCurrent} className="btn btn-primary min-h-9 px-3 py-1.5 text-[0.8rem] md:min-h-10 md:px-4 md:text-[0.9rem]">Onde estou</button>
        <button type="button" onClick={() => flow.fitView({ duration: 600, padding: 0.1 })} className="btn btn-ghost min-h-9 px-3 py-1.5 text-[0.8rem] md:min-h-10 md:px-4 md:text-[0.9rem]">Ver tudo</button>
      </div>
    </ReactFlow>
  );
}

export function RhizomeMap() {
  return (
    <div className="relative h-[calc(100dvh-230px)] min-h-[460px] overflow-hidden rounded-2xl border border-line shadow-card md:h-[calc(100dvh-210px)]">
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </div>
  );
}

/** Mesma rede em forma de lista (acessível e boa para o celular). */
export function RhizomeList() {
  const progress = useProgress();
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {curriculum.flatMap((m) =>
        m.lessons.map((l) => {
          const out = branches.filter((b) => b.from.includes(l.id));
          if (!out.length) return null;
          return (
            <section key={l.id} className={`c-${m.color} card p-4`}>
              <p className="font-extrabold"><span className="mr-1.5 font-display text-accent">{l.symbol}</span>{l.title}</p>
              <ul className="mt-2 grid gap-1.5 text-[0.9rem]">
                {out.map((b) => {
                  const k = BRANCH_KINDS[b.kind];
                  const done = !!progress.lessons[branchKey(b.id)]?.done;
                  return (
                    <li key={b.id} className="flex gap-2">
                      <span aria-hidden>{done ? '✓' : k.icon}</span>
                      {b.ready ? <a href={`/ramo/${b.id}`}>{b.title}</a> : <span className="text-ink-3">{b.title} (em breve)</span>}
                      <span className="sr-only">: {k.label}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        }),
      )}
    </div>
  );
}
