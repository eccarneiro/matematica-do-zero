import type { ComponentType } from 'react';
import type { TopicId } from '@/generators/registry';

export type ModuleColor = 'coral' | 'violet' | 'teal' | 'amber' | 'blue';

export interface LessonRef {
  id: string;
  title: string;
  /** Frase curta mostrada na trilha. */
  summary?: string;
  /** Palavras extras para a busca. */
  keywords: string;
  /** Tópico do treino infinito desta aula (presente quando a aula está publicada). */
  topic?: TopicId;
  /** Aula publicada. Aulas sem isso aparecem como "em breve". */
  ready?: boolean;
  /** Símbolo curto desenhado na bolinha da trilha (ex.: "½", "x²"). */
  symbol: string;
}

export interface CourseModule {
  id: string;
  number: number;
  title: string;
  tagline: string;
  /** Lugares e épocas por onde a história da unidade passa. */
  eras: string;
  color: ModuleColor;
  lessons: LessonRef[];
}

export interface Video {
  /** ID do YouTube, conferido pelo oEmbed antes de entrar no curso. */
  id: string;
  title: string;
  channel: string;
}

/**
 * Textos curtos (exemplos, usos, pergunta filosófica) aceitam HTML simples
 * e fórmulas entre \( \) ou \[ \]; são renderizados por <MathText>.
 */
export interface LessonMeta {
  history: {
    title: string;
    when: string;
    where: string;
    who?: string;
  };
  uses: { icon: string; title: string; text: string }[];
  think: { question: string; text: string };
  videos: Video[];
  examples: { problem: string; steps: string[] }[];
}

/** Conteúdo completo de uma aula: dados + textos longos em MDX. */
export interface LessonContent {
  meta: LessonMeta;
  History: ComponentType;
  Idea: ComponentType;
}
