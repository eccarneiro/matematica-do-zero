'use client';

import { useState } from 'react';
import { MathText } from '@/components/MathText';
import { IconCheck, IconClose } from '@/components/ui/icons';
import type { QuizQuestion } from '@/content/types';
import { checkAnswer } from '@/lib/math/answer';

const KEY_LABEL: Record<string, string> = { '-': '−', '/': 'a/b', ',': ',', '√': '√', '%': '%' };

/** Exercícios fixos de um ramo, um de cada vez, com explicação depois de responder. */
export function BranchQuiz({ questions, onFinish }: { questions: QuizQuestion[]; onFinish: (right: number) => void }) {
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');
  const [state, setState] = useState<'answering' | 'right' | 'wrong'>('answering');
  const [warn, setWarn] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  const q = questions[index];
  const finished = index >= questions.length;

  if (finished) {
    return (
      <div className="rounded-2xl border border-line bg-surface-2 p-5 text-center">
        <p className="text-[1.2rem] font-extrabold">{right} de {questions.length} de primeira</p>
        <p className="text-ink-2">Exercícios do ramo concluídos.</p>
      </div>
    );
  }

  function check(choice?: number) {
    const res = checkAnswer(q.answer, q.answer.type === 'choice' ? (choice ?? null) : value);
    if (res.status === 'empty') return;
    if (res.status === 'retry') return setWarn(res.message);
    setWarn(null);
    if (res.status === 'right') setRight((r) => r + 1);
    setState(res.status === 'right' ? 'right' : 'wrong');
  }

  function next() {
    const last = index + 1 >= questions.length;
    setIndex(index + 1);
    setValue('');
    setState('answering');
    if (last) onFinish(right);
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between text-[0.8rem] font-bold text-ink-3">
        <span>Exercício {index + 1} de {questions.length}</span>
        <span className="flex gap-1">
          {questions.map((_, i) => <i key={i} className={`h-1.5 w-6 rounded-full ${i < index ? 'bg-accent' : i === index ? 'bg-accent/50' : 'bg-surface-2'}`} />)}
        </span>
      </div>
      <MathText as="div" text={q.prompt} className="mb-4 text-[1.1rem] font-semibold" />

      {q.answer.type === 'choice' ? (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {q.answer.options.map((opt, i) => {
            const answer = q.answer as Extract<QuizQuestion['answer'], { type: 'choice' }>;
            const tone = state !== 'answering' && i === answer.correct ? 'c-success' : '';
            return (
              <button
                key={i}
                type="button"
                disabled={state !== 'answering'}
                onClick={() => check(i)}
                className={`${tone} cursor-pointer rounded-xl border px-4 py-3 text-left font-semibold ${tone ? 'border-accent bg-accent-soft text-accent' : 'border-edge bg-surface hover:border-accent'}`}
              >
                <MathText text={opt} />
              </button>
            );
          })}
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (state === 'answering') check(); else next(); }} className="grid gap-2.5">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            readOnly={state !== 'answering'}
            inputMode="decimal"
            autoComplete="off"
            placeholder="Sua resposta"
            className="rounded-xl border border-edge bg-surface px-4 py-3 text-[1.25rem] font-bold outline-none focus:border-accent"
          />
          {q.keys && (
            <div className="flex gap-2">
              {q.keys.map((k) => (
                <button key={k} type="button" onClick={() => setValue((v) => v + k)} className="h-10 min-w-12 cursor-pointer rounded-xl border border-edge bg-surface px-3 font-bold">
                  {KEY_LABEL[k] ?? k}
                </button>
              ))}
            </div>
          )}
        </form>
      )}

      {warn && <p className="mt-3 rounded-xl bg-warn-soft px-3 py-2 text-[0.9rem] font-semibold">{warn}</p>}

      {state !== 'answering' && (
        <div className={`mt-4 rounded-xl px-4 py-3 ${state === 'right' ? 'c-success bg-accent-soft' : 'c-danger bg-accent-soft'}`}>
          <p className="flex items-center gap-2 font-extrabold text-accent">
            {state === 'right' ? <IconCheck className="size-5" /> : <IconClose className="size-5" />}
            {state === 'right' ? 'Isso mesmo!' : 'Não foi dessa vez.'}
          </p>
          <MathText as="p" text={q.explanation} className="mt-1 text-ink" />
        </div>
      )}

      <div className="mt-4 flex justify-end gap-2">
        {state === 'answering' ? (
          <>
            <button type="button" onClick={() => setState('wrong')} className="btn btn-ghost min-h-11 py-2">Ver resposta</button>
            {q.answer.type !== 'choice' && (
              <button type="button" onClick={() => check()} disabled={!value.trim()} className="btn btn-primary min-h-11 py-2">Verificar</button>
            )}
          </>
        ) : (
          <button type="button" onClick={next} className="btn btn-primary min-h-11 py-2">
            {index + 1 >= questions.length ? 'Terminar' : 'Próximo'}
          </button>
        )}
      </div>
    </div>
  );
}
