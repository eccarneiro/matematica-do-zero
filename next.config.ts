import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
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
