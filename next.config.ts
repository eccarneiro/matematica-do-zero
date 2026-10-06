import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import { legacyLessons } from './src/content/curriculum';

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  // Aulas antigas viraram micro-aulas: links antigos levam à primeira da seção.
  async redirects() {
    return Object.entries(legacyLessons).flatMap(([oldId, [first]]) => [
      { source: `/aula/${oldId}`, destination: `/aula/${first}`, permanent: true },
      { source: `/treino/${oldId}`, destination: `/treino/${first}`, permanent: true },
    ]);
  },
};

// Fórmulas em MDX: $...$ na linha e $$...$$ em destaque.
// Com Turbopack, os plugins são passados pelo nome.
const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-math'],
    rehypePlugins: [['rehype-katex', { strict: false, throwOnError: true }]],
  },
});

export default withMDX(nextConfig);
