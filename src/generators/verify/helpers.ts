import type { Rational } from '@/lib/math/rational';
import type { Question } from '../types';

/**
 * Um verificador recebe uma questão gerada e confere, com expect(), que a
 * resposta está certa recalculando-a a partir de q.data — sem reaproveitar
 * o código do gerador.
 */
export type Verifiers = Record<string, (q: Question) => void>;

/** Resposta numérica esperada pela questão. */
export function expectedValue(q: Question): Rational {
  if (q.answer.type === 'number') return q.answer.value;
  throw new Error(`questão ${q.data.kind} não é numérica`);
}

/** Dados brutos da questão, com o tipo informado pelo verificador. */
export const dataOf = <T,>(q: Question) => q.data as unknown as T;
