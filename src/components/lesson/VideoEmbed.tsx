'use client';

import { useState } from 'react';
import type { Video } from '@/content/types';

/** Mostra só a miniatura; o player do YouTube carrega ao tocar (página mais leve no celular). */
export function VideoEmbed({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);
  const frame = 'block aspect-video w-full border-0 bg-black';
  return (
    <div className="card overflow-hidden">
      {playing ? (
        <iframe
          className={frame}
          src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={`Assistir: ${video.title}`} className={`${frame} relative cursor-pointer overflow-hidden p-0`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- miniatura externa do YouTube */}
          <img src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" loading="lazy" className="size-full object-cover opacity-90" />
          <span aria-hidden className="absolute inset-0 m-auto grid size-16 place-items-center rounded-full bg-white/95 border-2 border-edge shadow-[3px_3px_0_var(--edge)]">
            <span className="ml-1.5 border-y-[11px] border-l-[18px] border-y-transparent border-l-[#e33]" />
          </span>
        </button>
      )}
      <div className="px-4 py-3">
        <p className="text-[1rem] leading-snug font-extrabold">{video.title}</p>
        <p className="mt-0.5 text-[0.85rem] font-semibold text-ink-3">
          {video.channel} ·{' '}
          <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">
            abrir no YouTube
          </a>
        </p>
      </div>
    </div>
  );
}
