'use client';

import { useEffect, useRef } from 'react';
import { MathText } from '@/components/MathText';
import { LEVEL_NAMES, type Key, type Level } from '@/generators/types';
import { LEVEL_UP_STREAK, emptyStats } from '@/progress/model';
import { useProgress } from '@/progress/store';
import { usePractice, type PracticeState, type PracticeTopic } from './usePractice';

const LEVELS: Level[] = [1, 2, 3];
const KEY_LABEL: Record<Key, string> = { '-': '−', '/': 'a/b', ',': ',', '√': '√', '%': '%' };

/**
 * Treino infinito. Com um tópico mostra nível e placar do tópico;
 * com vários vira treino misto.
 */
export function Practice({ topics, compact = false }: { topics: PracticeTopic[]; compact?: boolean }) {
  const p = usePractice(topics);
  const progress = useProgress();
  const mixed = topics.length > 1;
  const c = p.current;
  const nextBtn = useRef<HTMLButtonElement>(null);
  const firstInput = useRef<HTMLInputElement>(null);
  const lastInput = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Resposta vazia: o formulário "treme".
  const shake = c?.shake ?? 0;
  useEffect(() => {
    if (shake) formRef.current?.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }],
      { duration: 300 },
    );
  }, [shake]);

  // Foco: no campo ao abrir questão nova; no botão "Nova questão" ao terminar.
  const question = c?.question;
  const finished = c?.finished;
  useEffect(() => {
    if (finished) nextBtn.current?.focus({ preventScroll: true });
    else if (question && !compact) firstInput.current?.focus({ preventScroll: true });
  }, [question, finished, compact]);

  if (!c) {
    return <div className="card h-64 animate-pulse" aria-label="Carregando questão" />;
  }

  const stats = progress.topics[p.topicIds[0]] ?? emptyStats();
  const q = c.question;

  function insertKey(key: string) {
    const input = lastInput.current ?? firstInput.current;
    if (!input || c!.finished) return;
    const index = Number(input.dataset.index ?? 0);
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    p.setValue(index, input.value.slice(0, start) + key + input.value.slice(end));
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + key.length, start + key.length);
    });
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (c!.finished) p.next();
      else p.submit();
    }
  }

  return (
    <div className="grid gap-3" onKeyDown={onKeyDown}>
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {mixed ? (
          <span className="pill">Treino misto</span>
        ) : (
          <div role="radiogroup" aria-label="Nível" className="inline-flex gap-0.5 rounded-full bg-surface-2 p-1">
            {LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={stats.level === level}
                onClick={() => p.setLevel(level)}
                className={`cursor-pointer rounded-full px-3.5 py-1.5 text-[0.88rem] ${stats.level === level ? 'bg-surface font-medium text-ink shadow-sm' : 'text-ink-2'}`}
              >
                {LEVEL_NAMES[level]}
              </button>
            ))}
          </div>
        )}
        <Scoreboard
          items={
            mixed
              ? [[p.session.correct, 'acertos'], [p.session.total, 'feitas']]
              : [[stats.correct, 'acertos'], [stats.streak, 'seguidos'], [stats.total, 'feitas']]
          }
          hot={!mixed && stats.streak >= 3}
        />
      </div>

      <div className="card px-4 py-5">
        {mixed && (
          <div className="mb-2.5 flex gap-1.5">
            <span className="pill">{topics[c.topicIndex].title}</span>
            <span className="pill bg-surface-2 text-ink-2">{LEVEL_NAMES[c.level]}</span>
          </div>
        )}
        <MathText as="div" text={q.prompt} className="mb-3 text-[1.12rem] font-normal [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden" />
        {q.figure && <div className="mx-auto mb-3.5 max-w-[420px] [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: q.figure }} />}

        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            p.submit();
          }}
          className="grid gap-2.5"
          autoComplete="off"
        >
          {q.answer.type === 'choice' ? (
            <Choices state={c} onPick={(i) => p.submit(i)} />
          ) : (
            <>
              <AnswerFields
                state={c}
                firstInput={firstInput}
                onFocus={(el) => (lastInput.current = el)}
                onChange={p.setValue}
              />
              <div className="flex flex-wrap gap-2">
                {(q.keys ?? ['-', '/', ',']).map((key) => (
                  <button
                    key={key}
                    type="button"
                    disabled={c.finished}
                    aria-label={`inserir ${key}`}
                    onMouseDown={(e) => e.preventDefault() /* mantém o teclado do celular aberto */}
                    onClick={() => insertKey(key)}
                    className="h-[42px] min-w-12 cursor-pointer rounded-xl border border-line bg-surface text-[1.1rem] font-medium disabled:opacity-40"
                  >
                    {KEY_LABEL[key]}
                  </button>
                ))}
              </div>
            </>
          )}
        </form>

        {c.feedback && <FeedbackBox feedback={c.feedback} />}

        {c.showSolution && (
          <div className="mt-3.5 rounded-xl bg-surface-2 px-4 py-3.5">
            <h4 className="mb-2 text-[0.95rem] font-semibold">Resolução passo a passo</h4>
            <ol className="mb-3 list-decimal pl-5 marker:font-semibold marker:text-accent">
              {q.steps.map((step, i) => (
                <MathText key={i} as="li" text={step} className="mb-2 pl-1" />
              ))}
            </ol>
            <p>
              Resposta: <MathText text={q.answerDisplay} className="font-semibold" />
            </p>
          </div>
        )}

        <div className="mt-3.5 flex flex-wrap gap-2 [&>*]:flex-auto">
          {!c.finished && (
            <button type="button" className="btn btn-primary" onClick={() => p.submit()}>
              Verificar
            </button>
          )}
          {(c.attempts > 0 || c.finished) && !c.showSolution && (
            <button type="button" className="btn btn-ghost" onClick={p.reveal}>
              Ver resolução
            </button>
          )}
          <button ref={nextBtn} type="button" className={`btn ${c.finished ? 'btn-primary' : 'btn-ghost'}`} onClick={p.next}>
            Nova questão ↻
          </button>
        </div>
      </div>

      {!mixed && (
        <p className="flex flex-wrap items-center gap-2 text-[0.84rem] text-ink-3">
          {stats.level < 3 ? (
            <>
              <span className="inline-flex gap-1" aria-hidden>
                {Array.from({ length: LEVEL_UP_STREAK }, (_, i) => (
                  <i key={i} className={`size-[9px] rounded-full ${i < stats.levelStreak ? 'bg-accent' : 'bg-line'}`} />
                ))}
              </span>
              {LEVEL_UP_STREAK} acertos seguidos para subir para <b>{LEVEL_NAMES[(stats.level + 1) as Level]}</b>
            </>
          ) : (
            'Você está no nível mais difícil. Respeito!'
          )}
        </p>
      )}
    </div>
  );
}

function Scoreboard({ items, hot }: { items: [number, string][]; hot: boolean }) {
  return (
    <div className="flex gap-3.5 text-[0.85rem] text-ink-2" aria-live="polite">
      {items.map(([value, label]) => (
        <span key={label} className={label === 'seguidos' && hot ? "before:content-['🔥']" : ''}>
          <b className={`text-[1.05rem] text-ink tabular-nums ${label === 'seguidos' && hot ? 'text-accent' : ''}`}>{value}</b> {label}
        </span>
      ))}
    </div>
  );
}

function Choices({ state, onPick }: { state: PracticeState; onPick: (i: number) => void }) {
  const answer = state.question.answer;
  if (answer.type !== 'choice') return null;
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-2">
      {answer.options.map((opt, i) => {
        const isRight = state.finished && i === answer.correct;
        const isWrong = state.wrongChoices.includes(i) || (state.finished && state.choice === i && i !== answer.correct);
        return (
          <button
            key={i}
            type="button"
            disabled={state.finished}
            onClick={() => onPick(i)}
            className={`min-h-[52px] cursor-pointer rounded-[14px] border-2 px-3 py-2.5 text-[1.05rem] ${
              isRight ? 'border-right bg-right-soft' : isWrong ? 'border-wrong bg-wrong-soft' : 'border-line bg-surface'
            }`}
          >
            <MathText text={opt} />
          </button>
        );
      })}
    </div>
  );
}

function AnswerFields({
  state,
  firstInput,
  onFocus,
  onChange,
}: {
  state: PracticeState;
  firstInput: React.RefObject<HTMLInputElement | null>;
  onFocus: (el: HTMLInputElement) => void;
  onChange: (index: number, value: string) => void;
}) {
  const q = state.question;
  const inputProps = (i: number) => ({
    ref: i === 0 ? firstInput : undefined,
    'data-index': i,
    value: state.values[i] ?? '',
    readOnly: state.finished,
    inputMode: 'decimal' as const,
    autoCapitalize: 'off',
    spellCheck: false,
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => onFocus(e.currentTarget),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(i, e.target.value),
  });

  if (q.answer.type === 'fields') {
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-2">
        {q.answer.fields.map((f, i) => (
          <label key={f.label} className="flex flex-col gap-1">
            <span className="text-[0.85rem] text-ink-2">{f.label}</span>
            <input
              {...inputProps(i)}
              placeholder="?"
              className="rounded-xl border-2 border-transparent bg-surface-2 px-3 py-2.5 text-[1.3rem] font-medium text-ink outline-none focus:border-accent read-only:opacity-75"
            />
          </label>
        ))}
      </div>
    );
  }
  return (
    <label className="flex items-center gap-2 rounded-[14px] border-2 border-transparent bg-surface-2 py-1 pr-1.5 pl-3.5 focus-within:border-accent">
      <span className="sr-only">Sua resposta</span>
      {q.prefix && <span className="font-medium text-ink-2">{q.prefix}</span>}
      <input
        {...inputProps(0)}
        placeholder={q.placeholder ?? 'Sua resposta'}
        className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-[1.3rem] font-medium text-ink outline-none read-only:opacity-75"
      />
      {q.suffix && <span className="pr-2 font-medium text-ink-2">{q.suffix}</span>}
    </label>
  );
}

function FeedbackBox({ feedback }: { feedback: NonNullable<PracticeState['feedback']> }) {
  const tone = {
    right: 'bg-right-soft text-right',
    wrong: 'bg-wrong-soft text-ink [&_b]:text-wrong',
    warn: 'bg-warn-soft text-ink',
  }[feedback.tone];
  return (
    <div className={`mt-3 rounded-xl px-3.5 py-3 text-[0.97rem] ${tone}`} aria-live="polite">
      <b>{feedback.title}</b> {feedback.text && <MathText text={feedback.text} />}
      {feedback.levelUp && <div className="mt-1.5 animate-[pop_.4s_ease] font-medium text-ink">{feedback.levelUp}</div>}
    </div>
  );
}
