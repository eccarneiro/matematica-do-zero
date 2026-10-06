export const NAV_ITEMS = [
  { href: '/', label: 'Trilha', match: (p: string) => p === '/' || p.startsWith('/modulo') || p.startsWith('/aula') },
  { href: '/treino', label: 'Treino', match: (p: string) => p.startsWith('/treino') },
  { href: '/busca', label: 'Buscar', match: (p: string) => p.startsWith('/busca') },
] as const;
