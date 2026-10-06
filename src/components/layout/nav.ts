export const NAV_ITEMS = [
  { href: '/', label: 'Trilha', icon: 'trail', match: (p: string) => p === '/' || p.startsWith('/modulo') },
  { href: '/treino', label: 'Treino', icon: 'practice', match: (p: string) => p === '/treino' },
  { href: '/busca', label: 'Buscar', icon: 'search', match: (p: string) => p.startsWith('/busca') },
  { href: '/perfil', label: 'Perfil', icon: 'user', match: (p: string) => p.startsWith('/perfil') },
] as const;
