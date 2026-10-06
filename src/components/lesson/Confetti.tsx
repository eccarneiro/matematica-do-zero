'use client';

const COLORS = ['var(--indigo)', 'var(--violet)', 'var(--teal)', 'var(--gold)', 'var(--blue)', 'var(--right)'];

/** "Aleatório" determinístico (a renderização precisa ser pura). */
const rand = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Chuva de confete em CSS (sem biblioteca). */
export function Confetti({ pieces = 70 }: { pieces?: number }) {
  const bits = Array.from({ length: pieces }, (_, i) => ({
    left: rand(i, 1) * 100,
    delay: rand(i, 2) * 0.8,
    duration: 2.2 + rand(i, 3) * 1.6,
    dx: `${(rand(i, 4) - 0.5) * 160}px`,
    rot: `${rand(i, 5) * 720 - 360}deg`,
    color: COLORS[i % COLORS.length],
    w: 7 + rand(i, 6) * 7,
    round: rand(i, 7) > 0.6,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {bits.map((b, i) => (
        <span
          key={i}
          className="absolute top-0"
          style={{
            left: `${b.left}%`,
            width: b.w,
            height: b.round ? b.w : b.w * 0.45,
            borderRadius: b.round ? '50%' : 2,
            background: b.color,
            animation: `confetti-fall ${b.duration}s ${b.delay}s cubic-bezier(.2,.6,.4,1) forwards`,
            ['--dx' as string]: b.dx,
            ['--rot' as string]: b.rot,
          }}
        />
      ))}
    </div>
  );
}
