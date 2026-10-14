import React from 'react';

export interface GalleryPhoto {
  src: string;
  alt: string;
}

/** One endlessly sliding row of photo cards. Pauses on hover. */
const Row: React.FC<{ photos: GalleryPhoto[]; direction: 'left' | 'right'; duration: number }> = ({
  photos,
  direction,
  duration,
}) => {
  // Two identical halves so the loop is seamless (track moves exactly -50%).
  const reps = photos.length >= 6 ? 1 : 3;
  const half = Array.from({ length: reps }, () => photos).flat();
  const track = [...half, ...half];
  return (
    <div className="group relative overflow-hidden py-4">
      <div
        className={`marquee-track flex w-max gap-5 sm:gap-7 group-hover:[animation-play-state:paused] ${
          direction === 'left' ? 'marquee-left' : 'marquee-right'
        }`}
        style={{ animationDuration: `${duration}s` }}
      >
        {track.map((p, i) => (
          <figure
            key={i}
            aria-hidden={i >= photos.length ? true : undefined}
            className={`shrink-0 rounded-[1.4rem] bg-white p-1.5 sm:p-2 border border-[#1C1B19]/6 shadow-[0_24px_50px_-30px_rgba(40,70,110,0.45)] transition-transform duration-500 hover:rotate-0 hover:scale-[1.03] ${
              i % 2 === 0 ? '-rotate-[1.5deg]' : 'rotate-[1.5deg]'
            }`}
          >
            <img
              src={p.src}
              alt={i < photos.length ? p.alt : ''}
              loading="lazy"
              draggable={false}
              className="h-48 sm:h-64 lg:h-72 w-auto rounded-[1.05rem] object-cover select-none"
            />
          </figure>
        ))}
      </div>
    </div>
  );
};

/** Two rows of photos gliding in opposite directions, faded at both edges. */
export const PhotoMarquee: React.FC<{ rowA: GalleryPhoto[]; rowB: GalleryPhoto[] }> = ({ rowA, rowB }) => (
  <div className="relative [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
    <Row photos={rowA} direction="right" duration={Math.max(55, rowA.length * 9)} />
    <Row photos={rowB} direction="left" duration={Math.max(60, rowB.length * 10)} />
  </div>
);
