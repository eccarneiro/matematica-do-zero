'use client';

import { useEffect, useRef } from 'react';
import { MathText } from '@/components/MathText';
import { IconCheck, IconClose, IconFlame, IconStar } from '@/components/ui/icons';
import { LEVEL_NAMES, type Key, type Level } from '@/generators/types';
import { LEVEL_UP_STREAK, emptyStats } from '@/progress/model';
import { useProgress } from '@/progress/store';
import { usePractice, type Feedback, type Outcome, type PracticeState, type PracticeTopic } from './usePractice';

const LEVELS: Level[] = [1, 2, 3];
const KEY_LABEL: Record<Key, string> = { '-': '−', '/': 'a/b', ',': ',', '√': '√', '%': '%' };

/**
 * Treino infinito no estilo "uma questão por tela": botão Verificar fixo
 * embaixo e painel colorido de resposta. Com vários tópicos vira treino misto.
 */
export function Practice({
  topics,
  onResult,
  showLevels = true,
}: {
  topics: PracticeTopic[];
  onResult?: (outcome: Outcome) => void;
  showLevels?: boolean;
}) {
  const p = usePractice(topics, onResult);
  const progress = useProgress();
  const mixed = topics.length > 1;
  const c = p.current;
  const firstInput = useRef<HTMLInputElement>(null);
  const lastInput = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const primary = useRef<HTMLButtonElement>(null);

  const question = c?.question;
  const finished = c?.finished;
  const hasFeedback = !!c?.feedback;
  useEffect(() => {
    if (hasFeedback) primary.current?.focus({ preventScroll: true });
    else if (question && !finished) firstInput.current?.focus({ preventScroll: true });
  }, [question, finished, hasFeedback]);

  const shake = c?.shake ?? 0;
  useEffect(() => {
    if (shake) formRef.current?.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }],
      { duration: 300 },
    );
  }, [shake]);

  if (!c) return <div className="mx-auto h-72 w-full max-w-[640px] animate-pulse rounded-3xl bg-surface-2" aria-label="Carregando questão" />;

  const topicId = p.topicIds[c.topicIndex];
  const stats = progress.topics[topicId] ?? emptyStats();
  const singleStats = progress.topics[p.topicIds[0]] ?? emptyStats();
  const q = c.question;
  const hasInput = q.answer.type === 'choice' ? c.choice !== null : c.values.some((v) => v.trim());

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

  function primaryAction() {
    if (c!.finished) p.next();
    else if (c!.feedback) p.dismiss();
    else p.submit();
  }

  return (
    <div
      className="flex flex-1 flex-col"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          primaryAction();
        }
      }}
    >
      <div className="mx-auto w-full max-w-[640px] flex-1 px-4 pt-4 pb-8">
        <div className="mb-5 flex min-h-9 flex-wrap items-center justify-between gap-2">
          {mixed ? (
            <span className="flex gap-1.5">
              <span className="pill">{topics[c.topicIndex].title}</span>
              <span className="pill bg-surface-2 text-ink-2">{LEVEL_NAMES[c.level]}</span>
            </span>
          ) : showLevels ? (
            <div role="radiogroup" aria-label="Nível" className="inline-flex gap-1 rounded-xl border-[1.5px] border-edge-soft bg-surface-2 p-1">
              {LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  role="radio"
                  aria-checked={singleStats.level === level}
                  onClick={() => p.setLevel(level)}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 text-[0.88rem] font-extrabold ${singleStats.level === level ? 'bg-surface text-accent shadow-card' : 'text-ink-3'}`}
                >
                  {LEVEL_NAMES[level]}
                </button>
              ))}
            </div>
          ) : <span />}
          <Combo streak={stats.streak} />
        </div>

        <MathText as="div" text={q.prompt} className="mb-5 text-[1.3rem] leading-snug font-bold [&_.katex]:text-[1.1em] [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden" />
        {q.figure && <div className="mx-auto mb-6 max-w-[360px] [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: q.figure }} />}

        <form ref={formRef} onSubmit={(e) => { e.preventDefault(); primaryAction(); }} autoComplete="off" className="grid gap-3">
          {q.answer.type === 'choice' ? (
            <Choices state={c} onPick={(i) => p.submit(i)} />
          ) : (
            <>
              <AnswerFields state={c} firstInput={firstInput} onFocus={(el) => (lastInput.current = el)} onChange={p.setValue} />
              <div className="flex flex-wrap gap-2">
                {(q.keys ?? ['-', '/', ',']).map((key) => (
                  <button
                    key={key}
                    type="button"
                    disabled={c.finished}
                    aria-label={`inserir ${key}`}
                    onMouseDown={(e) => e.preventDefault() /* mantém o teclado do celular aberto */}
                    onClick={() => insertKey(key)}
                    className="h-12 min-w-14 cursor-pointer rounded-xl border border-edge bg-surface px-3 text-[1.15rem] font-extrabold shadow-card active:scale-[0.98] disabled:opacity-40"
                  >
                    {KEY_LABEL[key]}
                  </button>
                ))}
              </div>
            </>
          )}
        </form>

        {!mixed && showLevels && (
          <p className="mt-7 flex flex-wrap items-center gap-2 text-[0.85rem] font-bold text-ink-3">
            {singleStats.level < 3 ? (
              <>
                <span className="inline-flex gap-1" aria-hidden>
                  {Array.from({ length: LEVEL_UP_STREAK }, (_, i) => (
                    <i key={i} className={`h-2.5 w-5 rounded-full ${i < singleStats.levelStreak ? 'bg-accent' : 'bg-line'}`} />
                  ))}
                </span>
                {LEVEL_UP_STREAK} acertos seguidos para subir para {LEVEL_NAMES[(singleStats.level + 1) as Level]}
              </>
            ) : (
              'Nível máximo. Respeito!'
            )}
          </p>
        )}
      </div>

      <Footer state={c} hasInput={hasInput} primaryRef={primary} onPrimary={primaryAction} onReveal={p.reveal} />
    </div>
  );
}

function Combo({ streak }: { streak: number }) {
  if (streak < 3) return null;
  return (
    <span key={streak} className="flex animate-[pop_.35s_ease] items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--flame)_15%,transparent)] px-3 py-1 text-[0.8rem] font-extrabold tracking-wide text-flame uppercase">
      <IconFlame className="size-5" /> {streak} seguidos
    </span>
  );
}

function Footer({
  state, hasInput, primaryRef, onPrimary, onReveal,
}: {
  state: PracticeState;
  hasInput: boolean;
  primaryRef: React.RefObject<HTMLButtonElement | null>;
  onPrimary: () => void;
  onReveal: () => void;
}) {
  const fb = state.feedback;
  const tone = fb?.tone === 'right' ? 'c-success' : fb?.tone === 'wrong' ? 'c-danger' : fb ? 'c-gold' : '';
  const label = state.finished ? 'Continuar' : fb?.tone === 'wrong' ? 'Tentar de novo' : fb ? 'Ok, entendi' : 'Verificar';

  return (
    <div className={`sticky bottom-0 z-10 border-t-2 ${fb ? `${tone} animate-[slide-up_.25s_ease] border-transparent bg-accent-soft` : 'border-line bg-bg'}`}>
      <div className="mx-auto max-w-[640px] px-4 pt-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
        {fb && <FeedbackBody feedback={fb} state={state} />}
        <div className="flex items-center gap-3">
          {/* "Não sei" e "Resolução" mostram a resolução (conta como questão sem acerto). */}
          {!fb && (
            <button type="button" onClick={onReveal} className="btn btn-ghost flex-none px-4">
              Não sei
            </button>
          )}
          {fb && !state.showSolution && fb.tone !== 'warn' && (
            <button type="button" onClick={onReveal} className="btn btn-ghost flex-none px-4">
              Resolução
            </button>
          )}
          <button
            ref={primaryRef}
            type="button"
            onClick={onPrimary}
            disabled={!fb && !hasInput}
            className={`btn btn-primary flex-1 ${!fb ? 'c-success' : ''}`}
          >
            {label}
          </button>
        </div>
      </div>
    </div>
  );
}

function FeedbackBody({ feedback, state }: { feedback: Feedback; state: PracticeState }) {
  const q = state.question;
  return (
    <div className="mb-4 animate-[fade-in_.25s_ease]">
      <div className="flex items-start gap-3">
        <span className="grid size-10 flex-none place-items-center rounded-full bg-surface text-accent">
          {feedback.tone === 'right' ? <IconCheck className="size-6" /> : feedback.tone === 'wrong' ? <IconClose className="size-6" /> : <span className="text-xl font-extrabold">!</span>}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-3 text-[1.3rem] leading-tight font-extrabold text-accent">
            {feedback.title}
            {!!feedback.xp && (
              <span className="flex items-center gap-1 text-[0.95rem] text-gold"><IconStar className="size-5" />+{feedback.xp} XP</span>
            )}
          </p>
          {feedback.text && <MathText as="p" text={feedback.text} className="mt-1 font-semibold text-ink" />}
          {feedback.levelUp && <p className="mt-1.5 animate-[pop_.4s_ease] font-extrabold text-ink">🎉 {feedback.levelUp}</p>}
        </div>
      </div>
      {state.showSolution && (
        <div className="mt-3 max-h-[40dvh] overflow-y-auto rounded-2xl bg-surface p-4">
          <ol className="list-decimal pl-5 marker:font-extrabold marker:text-accent">
            {q.steps.map((step, i) => (
              <MathText key={i} as="li" text={step} className="mb-2 pl-1" />
            ))}
          </ol>
          <p className="font-bold">
            Resposta: <MathText text={q.answerDisplay} className="font-extrabold" />
          </p>
        </div>
      )}
    </div>
  );
}

function Choices({ state, onPick }: { state: PracticeState; onPick: (i: number) => void }) {
  const answer = state.question.answer;
  if (answer.type !== 'choice') return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {answer.options.map((opt, i) => {
        const isRight = state.finished && i === answer.correct;
        const isWrong = state.wrongChoices.includes(i) || (state.finished && state.choice === i && i !== answer.correct);
        const tone = isRight ? 'c-success' : isWrong ? 'c-danger' : '';
        return (
          <button
            key={i}
            type="button"
            disabled={state.finished}
            onClick={() => onPick(i)}
            className={`${tone} min-h-16 cursor-pointer rounded-xl border-2 px-4 py-3 text-[1.15rem] font-bold active:scale-[0.98] ${
              tone ? 'border-edge bg-accent-soft text-accent shadow-card' : 'border-edge bg-surface shadow-card'
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
  state, firstInput, onFocus, onChange,
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
  const box = 'rounded-xl border border-edge bg-surface shadow-card focus-within:shadow-[3px_3px_0_var(--accent)]';

  if (q.answer.type === 'fields') {
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-3">
        {q.answer.fields.map((f, i) => (
          <label key={f.label} className="flex flex-col gap-1.5">
            <span className="text-[0.8rem] font-extrabold tracking-wide text-ink-3 uppercase">{f.label}</span>
            <span className={box}>
              <input {...inputProps(i)} placeholder="?" className="w-full bg-transparent px-4 py-3 text-[1.5rem] font-extrabold text-ink outline-none" />
            </span>
          </label>
        ))}
      </div>
    );
  }
  return (
    <label className={`flex items-center gap-2 px-4 ${box}`}>
      <span className="sr-only">Sua resposta</span>
      {q.prefix && <span className="text-[1.2rem] font-extrabold text-ink-3">{q.prefix}</span>}
      <input
        {...inputProps(0)}
        placeholder={q.placeholder ?? 'Sua resposta'}
        className="min-w-0 flex-1 bg-transparent py-3.5 text-[1.5rem] font-extrabold text-ink outline-none placeholder:font-bold placeholder:text-ink-3/60"
      />
      {q.suffix && <span className="text-[1.2rem] font-extrabold text-ink-3">{q.suffix}</span>}
    </label>
  );
}
