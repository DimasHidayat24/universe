import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

/* ============================================================================
   Decorative pieces for "Senja di Luar Angkasa".
   All purely visual and aria-hidden; no content lives in here.
   ============================================================================ */

interface CometProps {
  className?: string;
  /** Tilt of the comet's path in degrees (negative = falling to the left) */
  angle?: number;
  /** Seconds per full cycle (the streak itself is visible ~25% of it) */
  duration?: number;
  delay?: number;
}

/** A coral comet streak that crosses the sky every few seconds. */
export const Comet: React.FC<CometProps> = ({
  className = '',
  angle = -22,
  duration = 9,
  delay = 0,
}) => {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) return null;

  return (
    <div
      className={`pointer-events-none absolute ${className}`}
      style={{ transform: `rotate(${angle}deg)`, transformOrigin: 'right center' }}
      aria-hidden="true"
    >
      <div
        className="comet-streak relative animate-comet opacity-0"
        style={{ animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
      />
    </div>
  );
};

/** Planet curve with a plum → coral → peach sunset glowing behind its edge. */
export const PlanetHorizon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`pointer-events-none absolute inset-x-0 bottom-0 h-[46vh] min-h-[280px] overflow-hidden ${className}`}
    aria-hidden="true"
  >
    {/* Sky gradient plum → coral → peach rising from the horizon */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FF8A6B]/[0.07] to-[#FF8A6B]/[0.16]" />
    <div className="planet-horizon absolute inset-0" />
    {/* The dark planet's curved edge */}
    <div className="planet-body absolute left-1/2 top-[64%] w-[340vw] sm:w-[260vw] lg:w-[210vw] aspect-square -translate-x-1/2 rounded-full" />
  </div>
);

/** Subtle sunset glow that closes each section. */
export const SectionHorizon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`section-horizon pointer-events-none absolute inset-x-0 bottom-0 h-40 sm:h-56 ${className}`}
    aria-hidden="true"
  />
);

/** Comet-style divider between sections: a hairline crossed by a small comet. */
export const CometDivider: React.FC<{ className?: string }> = ({ className = '' }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className={`relative h-16 sm:h-20 w-full overflow-hidden bg-[#1A1030] ${className}`}
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-1/2 w-[min(72rem,88%)] -translate-x-1/2 h-px bg-gradient-to-r from-transparent via-[#B9A3E3]/25 to-transparent" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
        <span className="h-1 w-1 rounded-full bg-[#B9A3E3]/60" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#FF8A6B] shadow-[0_0_12px_3px_rgba(255,138,107,0.6)]" />
        <span className="h-1 w-1 rounded-full bg-[#B9A3E3]/60" />
      </div>
      {!prefersReducedMotion && (
        <motion.div
          className="absolute top-1/2 -mt-px left-0"
          initial={{ x: '110vw', opacity: 0 }}
          whileInView={{ x: '-30vw', opacity: [0, 1, 1, 0] }}
          viewport={{ once: false, amount: 0.6 }}
          transition={{ duration: 2.4, ease: [0.45, 0.05, 0.25, 1] }}
        >
          <div className="comet-streak relative" />
        </motion.div>
      )}
    </div>
  );
};

interface FloatingPolaroidProps {
  src: string;
  alt: string;
  className?: string;
  tilt?: number;
  /** 0 (far) … 1 (near): changes size feel, blur and drift amplitude */
  depth?: number;
  duration?: number;
  delay?: number;
}

/** A small polaroid that drifts slowly in the sky with a coral-glow edge. */
export const FloatingPolaroid: React.FC<FloatingPolaroidProps> = ({
  src,
  alt,
  className = '',
  tilt = -6,
  depth = 0.7,
  duration = 9,
  delay = 0,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [hasError, setHasError] = useState(false);
  const isPlaceholder = !src || src.trim() === '' || (src.startsWith('[') && src.endsWith(']'));
  const amp = 8 + depth * 12;

  return (
    <motion.div
      className={`pointer-events-none absolute ${className}`}
      style={{ filter: depth < 0.5 ? 'blur(0.6px)' : undefined, opacity: 0.55 + depth * 0.45 }}
      initial={{ opacity: 0, y: 30, rotate: tilt }}
      animate={
        prefersReducedMotion
          ? { opacity: 0.55 + depth * 0.45, y: 0, rotate: tilt }
          : { opacity: 0.55 + depth * 0.45, y: [0, -amp, 0], rotate: [tilt, tilt + 1.6, tilt] }
      }
      transition={
        prefersReducedMotion
          ? { duration: 0.6, delay }
          : {
              opacity: { duration: 1.2, delay },
              y: { duration, repeat: Infinity, ease: 'easeInOut', delay },
              rotate: { duration: duration * 1.3, repeat: Infinity, ease: 'easeInOut', delay },
            }
      }
      aria-hidden="true"
    >
      <div className="coral-glow bg-[#F7EEE3] p-2 pb-7 sm:p-2.5 sm:pb-9 rounded-[3px]">
        <div className="w-full aspect-[4/5] overflow-hidden bg-gradient-to-b from-[#2B1B4A] to-[#1A1030]">
          {!isPlaceholder && !hasError && (
            <img
              src={src}
              alt={alt}
              referrerPolicy="no-referrer"
              onError={() => setHasError(true)}
              className="w-full h-full object-cover saturate-[0.9]"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

interface FloatingLetterProps {
  className?: string;
  tilt?: number;
  depth?: number;
  duration?: number;
  delay?: number;
}

/** A folded letter (no text, just ruled lines and a coral seal) floating by. */
export const FloatingLetter: React.FC<FloatingLetterProps> = ({
  className = '',
  tilt = 8,
  depth = 0.6,
  duration = 11,
  delay = 0,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const amp = 6 + depth * 12;

  return (
    <motion.div
      className={`pointer-events-none absolute ${className}`}
      style={{ filter: depth < 0.5 ? 'blur(0.8px)' : undefined }}
      initial={{ opacity: 0, rotate: tilt }}
      animate={
        prefersReducedMotion
          ? { opacity: 0.5 + depth * 0.4, rotate: tilt }
          : { opacity: 0.5 + depth * 0.4, y: [0, -amp, 0], rotate: [tilt, tilt - 2, tilt] }
      }
      transition={
        prefersReducedMotion
          ? { duration: 0.6, delay }
          : {
              opacity: { duration: 1.4, delay },
              y: { duration, repeat: Infinity, ease: 'easeInOut', delay },
              rotate: { duration: duration * 1.2, repeat: Infinity, ease: 'easeInOut', delay },
            }
      }
      aria-hidden="true"
    >
      <div className="folded-letter coral-glow relative w-full aspect-[4/3] rounded-[2px] overflow-hidden">
        <div className="absolute inset-x-[14%] top-[20%] space-y-[9%]">
          <div className="h-px bg-[#2B1B4A]/25" />
          <div className="h-px bg-[#2B1B4A]/20 w-5/6" />
          <div className="h-px bg-[#2B1B4A]/20" />
          <div className="h-px bg-[#2B1B4A]/15 w-2/3" />
        </div>
        <span className="absolute right-[12%] bottom-[14%] h-[14%] aspect-square rounded-full bg-[#FF8A6B] shadow-[0_0_10px_2px_rgba(255,138,107,0.55)]" />
      </div>
    </motion.div>
  );
};
