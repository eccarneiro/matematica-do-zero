'use client';

import { useState } from 'react';
import type { Video } from '@/content/types';

/** Mostra só a miniatura; o player do YouTube carrega ao tocar (página mais leve no celular). */
export function VideoEmbed({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);
  const frame = 'block aspect-video w-full rounded-xl border-0 bg-black';
  return (
    <div>
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
          <span aria-hidden className="absolute inset-0 m-auto grid h-11 w-16 place-items-center rounded-xl bg-[#e33]">
            <span className="ml-1 border-y-[9px] border-l-[15px] border-y-transparent border-l-white" />
          </span>
        </button>
      )}
      <p className="mt-2 mb-0.5 text-[0.95rem] leading-snug font-normal">{video.title}</p>
      <p className="text-[0.82rem] text-ink-3">
        {video.channel} ·{' '}
        <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">
          abrir no YouTube
        </a>
      </p>
    </div>
  );
}
