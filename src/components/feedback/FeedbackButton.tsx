'use client';

import { usePathname } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import { submitFeedback } from '@/app/actions/feedback';

const FACES = [
  { value: 1, emoji: '😞', label: 'Muito ruim' },
  { value: 2, emoji: '🙁', label: 'Ruim' },
  { value: 3, emoji: '😐', label: 'Ok' },
  { value: 4, emoji: '🙂', label: 'Bom' },
  { value: 5, emoji: '🤩', label: 'Ótimo' },
];

/**
 * Botão que abre a janela de feedback. `prompt` muda o título (ex.: ao fim
 * de uma aula, "Como foi esta aula?").
 */
export function FeedbackButton({
  className = 'btn btn-ghost',
  label = 'Enviar feedback',
  prompt = 'Conte o que você achou',
}: {
  className?: string;
  label?: React.ReactNode;
  prompt?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const [rating, setRating] = useState<number | undefined>();
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'idle' | 'sent' | { error: string }>('idle');
  const [pending, startTransition] = useTransition();

  function open() {
    setStatus('idle');
    dialog.current?.showModal();
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const page = typeof window === 'undefined' ? pathname : pathname + window.location.hash;
      const res = await submitFeedback({ message, rating, email, page, website });
      if (res.ok) {
        setStatus('sent');
        setMessage('');
        setRating(undefined);
      } else {
        setStatus({ error: res.error });
      }
    });
  }

  return (
    <>
      <button type="button" onClick={open} className={className}>
        {label}
      </button>
      <dialog
        ref={dialog}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-auto w-[min(520px,calc(100vw-32px))] rounded-2xl border border-line bg-surface p-0 text-ink shadow-lift backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
      >
        {status === 'sent' ? (
          <div className="p-6 text-center">
            <p className="text-4xl">💜</p>
            <h2 className="mt-2 text-[1.5rem]">Obrigado!</h2>
            <p className="mt-1 text-ink-2">Seu feedback ajuda a melhorar o curso para todo mundo.</p>
            <button type="button" onClick={() => dialog.current?.close()} className="btn btn-primary mt-5 w-full">Fechar</button>
          </div>
        ) : (
          <form onSubmit={send} className="grid gap-4 p-6">
            <div>
              <h2 className="text-[1.5rem]">{prompt}</h2>
              <p className="text-[0.92rem] text-ink-2">Elogios, ideias, erros encontrados: tudo ajuda.</p>
            </div>
            <div role="radiogroup" aria-label="Nota" className="flex justify-between gap-2">
              {FACES.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  role="radio"
                  aria-checked={rating === f.value}
                  aria-label={f.label}
                  title={f.label}
                  onClick={() => setRating(rating === f.value ? undefined : f.value)}
                  className={`grid h-14 flex-1 cursor-pointer place-items-center rounded-xl border text-[1.7rem] transition ${rating === f.value ? 'scale-105 border-accent bg-accent-soft' : 'border-line bg-surface-2 grayscale-[0.4] hover:grayscale-0'}`}
                >
                  {f.emoji}
                </button>
              ))}
            </div>
            <label className="grid gap-1.5">
              <span className="text-[0.85rem] font-bold text-ink-2">Mensagem</span>
              <textarea
                required
                minLength={3}
                maxLength={2000}
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="O que funcionou? O que poderia ser melhor?"
                className="resize-y rounded-xl border border-edge bg-surface px-3.5 py-3 outline-none focus:border-accent"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-[0.85rem] font-bold text-ink-2">E-mail <span className="font-medium text-ink-3">(opcional, se quiser resposta)</span></span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                className="rounded-xl border border-edge bg-surface px-3.5 py-2.5 outline-none focus:border-accent"
              />
            </label>
            {/* campo-isca contra robôs: escondido de pessoas e leitores de tela */}
            <input type="text" tabIndex={-1} autoComplete="off" aria-hidden value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" name="website" />
            {typeof status === 'object' && <p className="rounded-xl bg-danger-soft px-3 py-2 text-[0.9rem] font-semibold text-danger">{status.error}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => dialog.current?.close()} className="btn btn-ghost flex-none">Cancelar</button>
              <button type="submit" disabled={pending || message.trim().length < 3} className="btn btn-primary flex-1">
                {pending ? 'Enviando…' : 'Enviar'}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
