'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { useAuthEnabled } from './Providers';

export function AuthButton() {
  return useAuthEnabled() ? <SessionButton /> : null;
}

function SessionButton() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!menu.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  if (status === 'loading') return <span className="size-10 rounded-full bg-surface-2" aria-hidden />;

  if (!session) {
    return (
      <button type="button" onClick={() => signIn('google')} className="btn btn-ghost min-h-10 px-3.5 py-2 text-sm" title="Entre com o Google para salvar seu progresso na nuvem">
        Entrar
      </button>
    );
  }

  const { name, email, image } = session.user;
  return (
    <div ref={menu} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Minha conta"
        className="grid size-10 cursor-pointer place-items-center overflow-hidden rounded-full border border-line bg-surface-2 font-medium"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar externo pequeno
          <img src={image} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          (name ?? email ?? '?').slice(0, 1).toUpperCase()
        )}
      </button>
      {open && (
        <div className="card absolute top-12 right-0 z-30 w-64 p-4 text-sm">
          <p className="font-medium">{name}</p>
          <p className="mb-3 truncate text-ink-3">{email}</p>
          <p className="mb-3 text-ink-2">Seu progresso está salvo na nuvem e sincroniza entre aparelhos.</p>
          <button type="button" onClick={() => signOut()} className="btn btn-ghost min-h-10 w-full py-2">
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
