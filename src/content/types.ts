import type { ComponentType } from 'react';
import type { TopicId } from '@/generators/registry';

export type ModuleColor = 'indigo' | 'violet' | 'teal' | 'amber' | 'rose';

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
  /** Símbolo curto do selo da aula no itinerário (ex.: "½", "x²"). */
  symbol: string;
  /** Época e lugar da parada no itinerário pela história (ex.: "628", "Índia"). */
  year: string;
  place: string;
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

/** Referência que comprova uma informação (ver issue #2). */
export interface Source {
  title: string;
  /** Autor ou instituição. */
  author: string;
  kind: 'livro' | 'artigo' | 'museu' | 'enciclopédia' | 'fonte primária' | 'norma';
  year?: string;
  /** Só URLs conferidas (abrem e são o conteúdo certo). */
  url?: string;
}

/**
 * Tipos de ramo do rizoma. Os de leitura ("culturas", "filosofia",
 * "conexao") são cartões; "aprofundar" e "desafio" trazem exercícios.
 */
export type BranchKind = 'aprofundar' | 'culturas' | 'filosofia' | 'conexao' | 'desafio';

export const READING_KINDS: readonly BranchKind[] = ['culturas', 'filosofia', 'conexao'];

/** Ramo lateral: aprofundamento opcional que sai de uma ou mais aulas. */
export interface BranchRef {
  id: string;
  title: string;
  kind: BranchKind;
  summary: string;
  /** Aulas do tronco de onde o ramo sai. */
  from: string[];
  /** Outras aulas ou ramos com que ele se conecta (arestas do rizoma). */
  links: string[];
  ready?: boolean;
}

/** Pergunta fixa de um ramo (diferente do treino infinito das aulas). */
export interface QuizQuestion {
  prompt: string;
  answer: import('@/lib/math/answer').ExpectedAnswer;
  /** Resposta como alguém digitaria (os testes conferem que é aceita). */
  answerText?: string;
  /** Explicação mostrada depois de responder. */
  explanation: string;
  keys?: import('@/generators/types').Key[];
}

export interface BranchMeta {
  sources: Source[];
  quiz?: QuizQuestion[];
}

export interface BranchContent {
  meta: BranchMeta;
  Body: ComponentType;
}
