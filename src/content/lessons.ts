import type { ComponentType } from 'react';
import type { LessonContent, LessonMeta } from './types';

type Loader<T> = () => Promise<{ default: T }>;

/** Junta os três arquivos de uma aula (dados, história e ideia). */
function lesson(meta: Loader<LessonMeta>, history: Loader<ComponentType>, idea: Loader<ComponentType>) {
  return async (): Promise<LessonContent> => {
    const [m, h, i] = await Promise.all([meta(), history(), idea()]);
    return { meta: m.default, History: h.default, Idea: i.default };
  };
}

// Conteúdo das aulas publicadas. As importações ficam explícitas para o
// bundler saber exatamente quais arquivos incluir.
const loaders: Record<string, () => Promise<LessonContent>> = {
  'naturais': lesson(
    () => import('./fundamentos/naturais/meta'),
    () => import('./fundamentos/naturais/historia.mdx'),
    () => import('./fundamentos/naturais/ideia.mdx'),
  ),
  'reta-inteiros': lesson(
    () => import('./fundamentos/reta-inteiros/meta'),
    () => import('./fundamentos/reta-inteiros/historia.mdx'),
    () => import('./fundamentos/reta-inteiros/ideia.mdx'),
  ),
  'oposto-modulo': lesson(
    () => import('./fundamentos/oposto-modulo/meta'),
    () => import('./fundamentos/oposto-modulo/historia.mdx'),
    () => import('./fundamentos/oposto-modulo/ideia.mdx'),
  ),
  'somar-inteiros': lesson(
    () => import('./fundamentos/somar-inteiros/meta'),
    () => import('./fundamentos/somar-inteiros/historia.mdx'),
    () => import('./fundamentos/somar-inteiros/ideia.mdx'),
  ),
  'sinais': lesson(
    () => import('./fundamentos/sinais/meta'),
    () => import('./fundamentos/sinais/historia.mdx'),
    () => import('./fundamentos/sinais/ideia.mdx'),
  ),
  'operacoes': lesson(
    () => import('./fundamentos/operacoes/meta'),
    () => import('./fundamentos/operacoes/historia.mdx'),
    () => import('./fundamentos/operacoes/ideia.mdx'),
  ),
  'zero': lesson(
    () => import('./fundamentos/zero/meta'),
    () => import('./fundamentos/zero/historia.mdx'),
    () => import('./fundamentos/zero/ideia.mdx'),
  ),
  'fracoes': lesson(
    () => import('./fundamentos/fracoes/meta'),
    () => import('./fundamentos/fracoes/historia.mdx'),
    () => import('./fundamentos/fracoes/ideia.mdx'),
  ),
  'decimais': lesson(
    () => import('./fundamentos/decimais/meta'),
    () => import('./fundamentos/decimais/historia.mdx'),
    () => import('./fundamentos/decimais/ideia.mdx'),
  ),
  'porcentagem': lesson(
    () => import('./fundamentos/porcentagem/meta'),
    () => import('./fundamentos/porcentagem/historia.mdx'),
    () => import('./fundamentos/porcentagem/ideia.mdx'),
  ),
  'potencias-raizes': lesson(
    () => import('./fundamentos/potencias-raizes/meta'),
    () => import('./fundamentos/potencias-raizes/historia.mdx'),
    () => import('./fundamentos/potencias-raizes/ideia.mdx'),
  ),
};

export function hasLessonContent(lessonId: string): boolean {
  return lessonId in loaders;
}

export async function getLessonContent(lessonId: string): Promise<LessonContent | undefined> {
  return loaders[lessonId]?.();
}
