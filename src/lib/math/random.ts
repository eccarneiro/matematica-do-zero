// Sorteio de números. Em produção usa Math.random; nos testes usa semente
// fixa para reproduzir exatamente as mesmas questões.

export interface Rng {
  next(): number;
  /** inteiro em [a, b] */
  int(a: number, b: number): number;
  /** inteiro em [a, b], diferente de zero */
  nonZero(a: number, b: number): number;
  pick<T>(arr: readonly T[]): T;
  chance(p: number): boolean;
  shuffle<T>(arr: readonly T[]): T[];
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRng(seed?: number): Rng {
  const next = seed === undefined ? Math.random : mulberry32(seed);
  const rng: Rng = {
    next,
    int: (a, b) => a + Math.floor(next() * (b - a + 1)),
    nonZero: (a, b) => {
      let v: number;
      do v = rng.int(a, b);
      while (v === 0);
      return v;
    },
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
    shuffle: (arr) => {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
  };
  return rng;
}
