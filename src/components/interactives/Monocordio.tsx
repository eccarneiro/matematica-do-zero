'use client';

import { useRef, useState } from 'react';
import { MathText } from '@/components/MathText';
import { Interactive, Readout, Slider } from './Interactive';

/** A corda inteira tem 72 partes: assim 1/2, 2/3, 3/4 e 8/9 caem em pontos inteiros. */
const TOTAL = 72;
const W = 440;
const PAD = 20;
const Y = 70;
const BASE_HZ = 220;

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

const NAMES: Record<string, string> = {
  '1:1': 'Uníssono: a mesma nota.',
  '2:1': 'Oitava: a "mesma" nota, mais aguda.',
  '3:2': 'Quinta: a consonância mais forte depois da oitava.',
  '4:3': 'Quarta: outra consonância dos pitagóricos.',
  '9:8': 'Tom inteiro: a diferença entre a quinta e a quarta.',
};

/**
 * Monocórdio: uma corda com um cavalete móvel. O comprimento que vibra,
 * comparado com a corda inteira, dá a razão do intervalo.
 */
export function Monocordio() {
  const [k, setK] = useState(48);
  const audio = useRef<AudioContext | null>(null);

  const g = gcd(TOTAL, k);
  const ratio = `${TOTAL / g}:${k / g}`;
  const name = NAMES[ratio];
  const simple = TOTAL / g <= 4;
  const x = (u: number) => PAD + (u / TOTAL) * (W - 2 * PAD);

  function play() {
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = (audio.current ??= new Ctx());
      void ctx.resume();
      const t = ctx.currentTime;
      [BASE_HZ, (BASE_HZ * TOTAL) / k].forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = f;
        const start = t + i * 0.6;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.12, start + 0.03);
        gain.gain.setValueAtTime(0.12, t + 1.6);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(t + 2.5);
      });
    } catch {
      // Sem áudio no navegador: o desenho continua funcionando.
    }
  }

  return (
    <Interactive title="Monocórdio" hint="Mova o cavalete. O botão toca a corda inteira e depois a parte que vibra (se o som estiver ligado).">
      <svg viewBox={`0 0 ${W} 136`} role="img" aria-label={`Corda vibrando em ${k} de ${TOTAL} partes: razão ${ratio}`} className="block h-auto w-full">
        {/* caixa */}
        <rect x={PAD - 10} y={Y + 14} width={W - 2 * PAD + 20} height={18} rx={6} className="f-surface2 s-line" strokeWidth={1.5} />
        {/* corda: parte presa (apagada) e parte que vibra */}
        <line x1={x(0)} x2={x(TOTAL - k)} y1={Y} y2={Y} className="s-ink2" strokeWidth={2} opacity={0.35} />
        <path
          d={`M${x(TOTAL - k)} ${Y} Q ${(x(TOTAL - k) + x(TOTAL)) / 2} ${Y - 26} ${x(TOTAL)} ${Y} Q ${(x(TOTAL - k) + x(TOTAL)) / 2} ${Y + 26} ${x(TOTAL - k)} ${Y}`}
          fill="none"
          className="s-acc"
          strokeWidth={2.5}
          opacity={0.9}
        />
        {/* pontas fixas e cavalete */}
        <rect x={x(0) - 4} y={Y - 8} width={8} height={22} rx={2} className="f-ink2" />
        <rect x={x(TOTAL) - 4} y={Y - 8} width={8} height={22} rx={2} className="f-ink2" />
        <path d={`M${x(TOTAL - k)} ${Y} l -9 14 h 18 z`} className="f-blue" />
        {/* marcas de 1/2, 2/3, 3/4 */}
        {[36, 48, 54].map((u) => (
          <g key={u}>
            <line x1={x(TOTAL - u)} x2={x(TOTAL - u)} y1={Y + 36} y2={Y + 42} className="s-ink2" strokeWidth={1.5} />
            <text x={x(TOTAL - u)} y={Y + 60} textAnchor="middle" fontSize={13} className="f-ink2">
              {u === 36 ? '1/2' : u === 48 ? '2/3' : '3/4'}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-2 grid gap-2.5">
        <Slider label="Parte que vibra" value={k} min={36} max={72} onChange={setK} format={(v) => `${v}/72`} />
      </div>
      <Readout>
        <MathText
          as="div"
          text={`\\(\\dfrac{\\text{corda inteira}}{\\text{parte que vibra}} = \\dfrac{${TOTAL}}{${k}} = ${TOTAL / g === k / g ? '1' : `\\dfrac{${TOTAL / g}}{${k / g}}`}\\)`}
          className="text-[1.1rem]"
        />
        <p className="mt-1 text-[0.9rem] text-ink-2">
          {name ?? (simple ? 'Razão simples.' : 'Razão de números grandes: para os gregos, um intervalo dissonante.')}
        </p>
      </Readout>
      <div className="mt-3 flex justify-center">
        <button type="button" onClick={play} className="btn btn-ghost min-h-11 px-4">
          🔊 Ouvir as duas notas
        </button>
      </div>
    </Interactive>
  );
}
