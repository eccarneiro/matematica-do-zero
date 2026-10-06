import type { Verifiers } from './helpers';
import { inteiros } from './inteiros';
import { operacoes } from './operacoes';
import { zero } from './zero';

/** Verificadores de todos os tópicos, indexados por q.data.kind (únicos entre tópicos). */
export const verifiers: Verifiers = { ...inteiros, ...operacoes, ...zero };
