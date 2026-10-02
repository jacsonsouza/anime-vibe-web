import type { Anime } from '@/api/recommendations';

interface AnimeCardProps {
  anime: Anime;
}

export function AnimeCard({ anime }: AnimeCardProps) {
  return (
    <article className="group flex h-full flex-col border border-line bg-base">
      <div className="relative aspect-2/3 overflow-hidden border-b border-line bg-surface">
        {anime.image_url !== null ? (
          <img
            src={anime.image_url}
            alt={`Capa de ${anime.title}`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-xs font-mono tracking-widest text-muted uppercase">
            Sem capa disponível
          </div>
        )}

        {anime.score !== null && (
          <span className="absolute top-2 right-2 rounded bg-accent px-2 py-0.5 font-mono text-xs font-bold text-white">
            ★ {anime.score.toFixed(1)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="text-sm font-bold leading-snug text-white">
          {anime.title}
        </h3>

        {anime.genres.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {anime.genres.map((genre) => (
              <li
                key={genre}
                className="text-xs font-mono tracking-widest text-muted uppercase"
              >
                {genre}
              </li>
            ))}
          </ul>
        )}

        {anime.synopsis !== null && (
          <p className="line-clamp-3 text-xs leading-relaxed text-muted">
            {anime.synopsis}
          </p>
        )}

        {anime.url !== null && (
          <a
            href={anime.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto pt-1 font-mono text-xs font-bold tracking-widest text-accent uppercase hover:text-white"
          >
            Ver no MyAnimeList →
          </a>
        )}
      </div>
    </article>
  );
}
