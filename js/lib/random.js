// Gerador de números aleatórios. Em produção usa Math.random; nos testes
// usa uma semente fixa para reproduzir as mesmas questões.

export function makeRng(seed) {
  let next;
  if (seed === undefined) {
    next = Math.random;
  } else {
    // mulberry32
    let t = seed >>> 0;
    next = () => {
      t += 0x6d2b79f5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rng = {
    next,
    // inteiro em [a, b]
    int: (a, b) => a + Math.floor(next() * (b - a + 1)),
    // inteiro em [a, b] diferente de zero
    nonZero: (a, b) => {
      let v;
      do v = rng.int(a, b); while (v === 0);
      return v;
    },
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
    sign: () => (next() < 0.5 ? -1 : 1),
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
