// Ícones desenhados para a plataforma (traço arredondado, combinam com a Nunito).

type P = { className?: string };
const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const IconTrail = ({ className }: P) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} {...stroke}>
    <path d="M6 20c0-3 3-4 6-4s6-1 6-4-3-4-6-4-6-1-6-4" />
    <circle cx="6" cy="20" r="1.6" fill="currentColor" />
    <circle cx="6" cy="4" r="1.6" fill="currentColor" />
  </svg>
);

export const IconMap = ({ className }: P) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} {...stroke}>
    <circle cx="6" cy="6" r="2.2" />
    <circle cx="18" cy="8" r="2.2" />
    <circle cx="8" cy="18" r="2.2" />
    <circle cx="17" cy="17" r="1.6" />
    <path d="M8 7l8 .8M7 8l.6 7.8M10 17.6l5.4-.4M17.6 10.2l-.4 5.2" />
  </svg>
);

export const IconPractice = ({ className }: P) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} {...stroke}>
    <path d="M4 12h2m12 0h2M6.5 8v8M17.5 8v8M9 10v4M15 10v4M9 12h6" />
  </svg>
);

export const IconSearch = ({ className }: P) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} {...stroke}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </svg>
);

export const IconUser = ({ className }: P) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} {...stroke}>
    <circle cx="12" cy="8.5" r="3.8" />
    <path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4s6.3 1.8 7.5 5.4" />
  </svg>
);

export const IconClose = ({ className }: P) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} {...stroke}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const IconLock = ({ className }: P) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} {...stroke}>
    <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
  </svg>
);

export const IconCheck = ({ className }: P) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} {...stroke} strokeWidth={3.2}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

export const IconArrow = ({ className }: P) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} {...stroke}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/** Chama da sequência de dias (colorida). */
export const IconFlame = ({ className, off = false }: P & { off?: boolean }) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className}>
    <path
      d="M12.5 2.5c.6 3.2-1.1 4.9-2.6 6.6C8.5 10.7 7 12.4 7 15a5 5 0 0 0 10 0c0-2.3-1.1-3.8-2-5 .1 1.4-.4 2.4-1.3 2.9.4-3.6-.4-7.6-1.2-10.4z"
      fill={off ? 'var(--line)' : 'var(--flame)'}
    />
    <path d="M12 21a2.8 2.8 0 0 1-2.8-2.8c0-1.6 1.2-2.6 2-3.6.2 1 .8 1.6 1.4 1.8.6-.6.8-1.4.8-2.1.9 1 1.4 2.1 1.4 3.4A2.8 2.8 0 0 1 12 21z" fill={off ? 'var(--surface-2)' : 'var(--gold)'} />
  </svg>
);

/** Estrela de XP (colorida). */
export const IconStar = ({ className }: P) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className}>
    <path
      d="M12 2.8l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.6l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"
      fill="var(--gold)"
      stroke="var(--gold-shade)"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconSun = ({ className }: P) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} {...stroke}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
  </svg>
);

export const IconMoon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} {...stroke}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
  </svg>
);
