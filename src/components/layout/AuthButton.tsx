'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useAuthEnabled } from './Providers';

/** Cartão de conta do perfil: login com Google para salvar o progresso na nuvem. */
export function AccountCard() {
  return useAuthEnabled() ? <SessionCard /> : <Card title="Visitante" text="Seu progresso fica salvo neste aparelho. O login para sincronizar entre aparelhos chega em breve." />;
}

function Card({ title, text, image, action }: { title: string; text: string; image?: string | null; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-wrap items-center gap-4 p-5">
      <span className="grid size-16 flex-none place-items-center overflow-hidden rounded-full bg-accent-soft font-serif text-2xl font-bold text-accent">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar externo pequeno
          <img src={image} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          title.slice(0, 1).toUpperCase()
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[1.3rem] font-black">{title}</p>
        <p className="text-[0.92rem] text-ink-2">{text}</p>
      </div>
      {action && <div className="w-full sm:w-auto">{action}</div>}
    </div>
  );
}

function SessionCard() {
  const { data: session, status } = useSession();
  if (status === 'loading') return <div className="card h-28 animate-pulse" />;
  if (!session) {
    return (
      <Card
        title="Visitante"
        text="Entre com o Google para salvar seu progresso na nuvem e continuar em qualquer aparelho."
        action={
          <button type="button" onClick={() => signIn('google')} className="btn btn-primary c-blue w-full">
            Entrar com Google
          </button>
        }
      />
    );
  }
  const { name, email, image } = session.user;
  return (
    <Card
      title={name ?? email ?? 'Você'}
      text="Progresso salvo na nuvem e sincronizado entre aparelhos."
      image={image}
      action={
        <button type="button" onClick={() => signOut()} className="btn btn-ghost w-full">
          Sair
        </button>
      }
    />
  );
}
