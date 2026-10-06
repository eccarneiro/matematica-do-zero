import katex from 'katex';
import type { ElementType } from 'react';

const MATH = /\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)/g;

/**
 * Converte um texto com HTML simples e fórmulas entre \( \) ou \[ \] em HTML
 * com o KaTeX já renderizado. O conteúdo vem do próprio curso (nunca do usuário).
 */
export function renderMathHtml(text: string): string {
  return text.replace(MATH, (_, display: string | undefined, inline: string | undefined) =>
    katex.renderToString(display ?? inline ?? '', { displayMode: display !== undefined, throwOnError: false }),
  );
}

export function MathText({ text, as: Tag = 'span', className }: { text: string; as?: ElementType; className?: string }) {
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: renderMathHtml(text) }} />;
}
