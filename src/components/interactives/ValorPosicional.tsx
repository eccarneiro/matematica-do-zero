'use client';

import { useState } from 'react';
import { MathText } from '@/components/MathText';
import { Interactive, Readout } from './Interactive';

const NAMES = ['Milhar', 'Centena', 'Dezena', 'Unidade'];
const PLURAL = ['milhares', 'centenas', 'dezenas', 'unidades'];
const VALUES = [1000, 100, 10, 1];
const W = 360;
const COL = W / 4;
const BOTTOM = 186;
const GAP = 15;

/** Inteiro com separador de milhar em LaTeX. */
const tex = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '{.}');

/** Quadro de valor posicional: contas no ábaco, casas vazias e trocas de 10 por 1. */
export function ValorPosicional() {
  const [digits, setDigits] = useState([3, 0, 4, 5]);
  const [note, setNote] = useState('');

  const n = digits.reduce((s, d, i) => s + d * VALUES[i], 0);
  const first = digits.findIndex((d) => d !== 0);
  // Só é "casa vazia" o zero que fica depois do primeiro algarismo (zero à esquerda não se escreve).
  const empty = (i: number) => digits[i] === 0 && first !== -1 && i > first;

  function add(i: number, delta: 1 | -1) {
    const next = digits.slice();
    let j = i;
    let msg = '';
    if (delta === 1) {
      // 9 + 1: a casa volta a 0 e uma conta passa para a casa da esquerda.
      while (j >= 0 && next[j] === 9) {
        next[j] = 0;
        if (j > 0) msg = `Troca: 10 ${PLURAL[j]} viram 1 ${NAMES[j - 1].toLowerCase()}.`;
        j--;
      }
      if (j < 0) return;
      next[j]++;
    } else {
      // 0 − 1: desmancha 1 da casa da esquerda em 10 desta.
      while (j >= 0 && next[j] === 0) {
        next[j] = 9;
        if (j > 0) msg = `Troca: 1 ${NAMES[j - 1].toLowerCase()} vira 10 ${PLURAL[j]}.`;
        j--;
      }
      if (j < 0) return;
      next[j]--;
    }
    setDigits(next);
    setNote(msg);
  }

  const used = first === -1 ? [] : digits.map((d, i) => ({ d, i })).slice(first);
  const expanded = used.map(({ d, i }) => (i === 3 ? String(d) : `${d} \\cdot ${tex(VALUES[i])}`)).join(' + ');
  const hasEmpty = digits.some((_, i) => empty(i));
  const without = Number(digits.filter((d) => d !== 0).join('') || '0');

  return (
    <Interactive title="Quadro de valor posicional" hint="Use + e − em cada casa. Passe do 9 para ver a troca de 10 por 1.">
      <svg viewBox={`0 0 ${W} 236`} role="img" aria-label={`Ábaco mostrando o número ${n}`} className="block h-auto w-full select-none">
        {digits.map((d, i) => {
          const cx = COL * i + COL / 2;
          const isEmpty = empty(i);
          return (
            <g key={i}>
              {isEmpty && <rect x={COL * i + 5} y={30} width={COL - 10} height={202} rx={12} className="f-acc-soft s-acc" strokeDasharray="5 4" strokeWidth={1.5} />}
              <text x={cx} y={20} textAnchor="middle" fontSize={15} fontWeight={600} className="f-ink2">
                {NAMES[i]}
              </text>
              <line x1={cx} x2={cx} y1={40} y2={BOTTOM + 8} className="s-line" strokeWidth={4} strokeLinecap="round" />
              <line x1={cx - 32} x2={cx + 32} y1={BOTTOM + 9} y2={BOTTOM + 9} className="s-ink2" strokeWidth={2} />
              {Array.from({ length: d }, (_, k) => (
                <ellipse key={k} cx={cx} cy={BOTTOM - k * GAP} rx={27} ry={7} className="f-blue s-ink" strokeWidth={1} />
              ))}
              {isEmpty && (
                <text x={cx} y={118} textAnchor="middle" fontSize={14} fontWeight={600} className="f-acc">
                  vazia
                </text>
              )}
              <text x={cx} y={225} textAnchor="middle" fontSize={26} fontWeight={700} className={isEmpty ? 'f-acc' : i < first || first === -1 ? 'f-line' : 'f-ink'}>
                {d}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {digits.map((d, i) => (
          <div key={i} className="flex gap-1">
            <button
              type="button"
              aria-label={`Tirar 1 ${NAMES[i].toLowerCase()}`}
              disabled={n === 0 || (d === 0 && digits.slice(0, i).every((x) => x === 0))}
              onClick={() => add(i, -1)}
              className="h-10 flex-1 cursor-pointer rounded-lg border-[1.5px] border-line bg-surface text-lg font-semibold disabled:cursor-not-allowed disabled:opacity-35"
            >
              −
            </button>
            <button
              type="button"
              aria-label={`Pôr 1 ${NAMES[i].toLowerCase()}`}
              disabled={digits.slice(0, i + 1).every((x) => x === 9)}
              onClick={() => add(i, 1)}
              className="h-10 flex-1 cursor-pointer rounded-lg border-[1.5px] border-accent bg-accent-soft text-lg font-semibold text-accent disabled:cursor-not-allowed disabled:opacity-35"
            >
              +
            </button>
          </div>
        ))}
      </div>

      <Readout>
        <MathText as="div" text={`\\(${tex(n)}\\)`} className="text-[1.5rem] font-semibold" />
        {first !== -1 && <MathText as="div" text={`\\(${expanded}\\)`} className="mt-1 text-[0.95rem]" />}
        <p className="mt-1.5 text-[0.9rem] text-ink-2">
          {note && <span className="font-medium text-accent">{note} </span>}
          {first === -1 ? (
            'Nenhuma conta em nenhuma casa: o número é zero.'
          ) : hasEmpty ? (
            <MathText text={`O \\(0\\) marca a casa vazia. Sem ele, \\(${tex(n)}\\) viraria \\(${tex(without)}\\).`} />
          ) : (
            'Nenhuma casa vazia. Zere uma casa do meio para ver o papel do zero.'
          )}
        </p>
      </Readout>
    </Interactive>
  );
}
