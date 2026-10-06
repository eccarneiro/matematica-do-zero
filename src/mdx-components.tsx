import type { MDXComponents } from 'mdx/types';

// Obrigatório para o @next/mdx no App Router. Os componentes interativos são
// importados diretamente em cada arquivo .mdx.
const components: MDXComponents = {};

export function useMDXComponents(): MDXComponents {
  return components;
}
