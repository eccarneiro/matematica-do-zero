'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { checkAnswer } from '@/lib/math/answer';
import { makeRng } from '@/lib/math/random';
import { loadGenerator, type TopicId } from '@/generators/registry';
import { LEVEL_NAMES, type Generator, type Level, type Question } from '@/generators/types';
import { progressStore } from '@/progress/store';

export interface PracticeTopic {
  topic: TopicId;
  title: string;
}

export type Feedback = { tone: 'right' | 'wrong' | 'warn'; title: string; text?: string; levelUp?: string };

export interface PracticeState {
  topicIndex: number;
  level: Level;
  question: Question;
  attempts: number;
  finished: boolean;
  /** índice escolhido (múltipla escolha) */
  choice: number | null;
  /** opções marcadas como erradas na primeira tentativa */
  wrongChoices: number[];
  values: string[];
  feedback: Feedback | null;
  showSolution: boolean;
  /** incrementa para disparar a animação de "tremer" */
  shake: number;
}

const PRAISE = ['Acertou!', 'Mandou bem!', 'Isso aí!', 'Perfeito!', 'Exato!', 'Certinho!'];

/**
 * Sessão de treino infinito: sorteia questões, corrige, dá dica no primeiro
 * erro, mostra a resolução e registra o placar.
 * O placar é gravado nos handlers (nunca dentro de setState), para não contar
 * em dobro no modo estrito do React.
 */
export function usePractice(topics: PracticeTopic[]) {
  const rng = useMemo(() => makeRng(), []);
  const [generators, setGenerators] = useState<Generator[] | null>(null);
  const [current, setCurrent] = useState<PracticeState | null>(null);
  const [session, setSession] = useState({ correct: 0, total: 0 });
  const topicKey = topics.map((t) => t.topic).join(',');
  const topicIds = useMemo(() => topicKey.split(',') as TopicId[], [topicKey]);

  const makeQuestion = useCallback(
    (gens: Generator[]): PracticeState => {
      const topicIndex = rng.int(0, gens.length - 1);
      const level = progressStore.topic(topicIds[topicIndex]).level;
      const question = gens[topicIndex].generate(level, rng);
      const fields = question.answer.type === 'fields' ? question.answer.fields.length : 1;
      return {
        topicIndex, level, question, attempts: 0, finished: false, choice: null, wrongChoices: [],
        values: Array(fields).fill(''), feedback: null, showSolution: false, shake: 0,
      };
    },
    [rng, topicIds],
  );

  // Carrega os geradores (sob demanda) sempre que a lista de tópicos muda.
  useEffect(() => {
    let alive = true;
    Promise.all(topicIds.map(loadGenerator)).then((gens) => {
      if (!alive) return;
      setGenerators(gens);
      setCurrent(makeQuestion(gens));
      setSession({ correct: 0, total: 0 });
    });
    return () => {
      alive = false;
    };
  }, [topicIds, makeQuestion]);

  // Mantém a última versão do estado acessível aos handlers.
  const ref = useRef(current);
  useEffect(() => {
    ref.current = current;
  });

  const next = useCallback(() => {
    if (generators) setCurrent(makeQuestion(generators));
  }, [generators, makeQuestion]);

  const record = useCallback(
    (c: PracticeState, firstTry: boolean): string | undefined => {
      const { leveledUp, stats } = progressStore.recordResult(topicIds[c.topicIndex], firstTry);
      setSession((s) => ({ correct: s.correct + (firstTry ? 1 : 0), total: s.total + 1 }));
      return leveledUp ? `Subiu de nível! Agora: ${LEVEL_NAMES[stats.level]}` : undefined;
    },
    [topicIds],
  );

  const update = (next: PracticeState) => {
    ref.current = next;
    setCurrent(next);
  };

  const submit = useCallback(
    (choiceOverride?: number) => {
      const c = ref.current;
      if (!c || c.finished) return;
      const q = c.question;
      const choice = choiceOverride ?? c.choice;
      const input = q.answer.type === 'choice' ? choice : q.answer.type === 'fields' ? c.values : c.values[0];
      const result = checkAnswer(q.answer, input);

      switch (result.status) {
        case 'empty':
          return update({ ...c, shake: c.shake + 1 });
        case 'retry':
          return update({ ...c, choice, feedback: { tone: 'warn', title: 'Quase lá.', text: result.message } });
        case 'right': {
          const firstTry = c.attempts === 0;
          const levelUp = record(c, firstTry);
          return update({
            ...c, choice, finished: true,
            feedback: firstTry
              ? { tone: 'right', title: rng.pick(PRAISE), levelUp }
              : { tone: 'right', title: 'Agora sim!', text: 'Na próxima, de primeira.' },
          });
        }
        case 'wrong':
          if (c.attempts === 0) {
            return update({
              ...c, attempts: 1, choice: null,
              wrongChoices: q.answer.type === 'choice' && choice !== null ? [choice] : [],
              feedback: { tone: 'wrong', title: 'Quase.', text: `Dica: ${q.hint}` },
            });
          }
          record(c, false);
          return update({
            ...c, attempts: c.attempts + 1, choice, finished: true, showSolution: true,
            feedback: { tone: 'wrong', title: 'Não foi dessa vez.', text: 'Veja como resolver:' },
          });
      }
    },
    [rng, record],
  );

  /** Mostra a resolução; se a questão ainda estava aberta, conta como feita sem acerto. */
  const reveal = useCallback(() => {
    const c = ref.current;
    if (!c) return;
    if (!c.finished) record(c, false);
    update({ ...c, finished: true, showSolution: true, feedback: c.finished ? c.feedback : null });
  }, [record]);

  const setValue = useCallback((index: number, value: string) => {
    const c = ref.current;
    if (c && !c.finished) update({ ...c, values: c.values.map((v, i) => (i === index ? value : v)) });
  }, []);

  const setLevel = useCallback(
    (level: Level) => {
      progressStore.setLevel(topicIds[0], level);
      next();
    },
    [next, topicIds],
  );

  return { current, session, topicIds, submit, next, reveal, setValue, setLevel };
}
