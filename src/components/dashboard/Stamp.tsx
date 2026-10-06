import type { LessonRef } from '@/content/types';

/**
 * Selo de passaporte de uma aula: carimbo redondo com o símbolo, o ano e o
 * lugar. Inclinado e colorido quando conquistado; tracejado quando não.
 */
export function Stamp({
  lesson, earned, size = 88, animate = false,
}: {
  lesson: Pick<LessonRef, 'symbol' | 'year' | 'place' | 'title'>;
  earned: boolean;
  size?: number;
  animate?: boolean;
}) {
  const id = `arc-${lesson.symbol}-${lesson.place}`.replace(/\W/g, '');
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={`${lesson.title}: ${earned ? 'selo conquistado' : 'selo ainda não conquistado'}`}
      className={earned ? 'text-accent' : 'text-ink-3/50'}
      style={earned ? { transform: 'rotate(-8deg)', animation: animate ? 'stamp .5s cubic-bezier(.3,1.4,.5,1) both' : undefined } : undefined}
    >
      <defs>
        <path id={id} d="M 50 50 m -33 0 a 33 33 0 1 1 66 0 a 33 33 0 1 1 -66 0" />
      </defs>
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={earned ? undefined : '4 5'} />
      <circle cx="50" cy="50" r="39" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={earned ? 1 : 0.6} />
      {earned && <circle cx="50" cy="50" r="27" className="f-acc-soft" />}
      <text fontSize="9.5" fontWeight="900" fill="currentColor">
        {/* o texto ocupa a volta inteira, espaçado por igual */}
        <textPath href={`#${id}`} startOffset="0%" textLength={196} lengthAdjust="spacing">
          {`${lesson.place.toUpperCase()} • ${lesson.year.toUpperCase()} •`}
        </textPath>
      </text>
      <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-display)" fontWeight="700" fontSize={lesson.symbol.length > 2 ? 17 : 24} fill="currentColor">
        {lesson.symbol}
      </text>
    </svg>
  );
}
