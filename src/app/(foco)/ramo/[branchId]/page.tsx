import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BranchView, type LinkTarget } from '@/components/branch/BranchView';
import { branchDepth, branches, branchesFrom, findBranch, getBranchContent } from '@/content/branches';
import { findLesson } from '@/content/curriculum';

export const dynamicParams = false;

export function generateStaticParams() {
  return branches.filter((b) => b.ready).map((b) => ({ branchId: b.id }));
}

export async function generateMetadata({ params }: PageProps<'/ramo/[branchId]'>): Promise<Metadata> {
  const b = findBranch((await params).branchId);
  return b ? { title: b.title, description: b.summary } : {};
}

/** Resolve um id do rizoma (aula ou ramo) para título e link. */
function target(id: string): LinkTarget {
  const branch = findBranch(id);
  if (branch) return { id, title: branch.title, kind: branch.kind, href: branch.ready ? `/ramo/${id}` : null };
  const lesson = findLesson(id);
  if (lesson) return { id, title: lesson.lesson.title, kind: 'aula', href: lesson.lesson.ready ? `/aula/${id}` : null };
  throw new Error(`id desconhecido no rizoma: ${id}`);
}

export default async function BranchPage({ params }: PageProps<'/ramo/[branchId]'>) {
  const branch = findBranch((await params).branchId);
  const content = branch && (await getBranchContent(branch.id));
  if (!branch || !content) notFound();
  const { Body, meta } = content;

  return (
    <BranchView
      id={branch.id}
      title={branch.title}
      kind={branch.kind}
      summary={branch.summary}
      from={branch.from.map(target)}
      links={branch.links.map(target)}
      deeper={branchesFrom(branch.id).map((b) => target(b.id))}
      depth={branchDepth(branch.id)}
      quiz={meta.quiz}
      sources={meta.sources}
    >
      <Body />
    </BranchView>
  );
}
