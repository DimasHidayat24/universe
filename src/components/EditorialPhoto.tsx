import React, { useState } from 'react';
import { motion, MotionValue, useReducedMotion } from 'motion/react';
import { Image as ImageIcon } from 'lucide-react';

interface EditorialPhotoProps {
  src: string;
  alt: string;
  placeholderLabel: string;
  aspectClass?: string;
  parallaxY?: MotionValue<number>;
  caption?: string;
  indexLabel?: string;
  theme?: 'dark' | 'light';
  priority?: boolean;
  delay?: number;
  /** Resting tilt of the floating polaroid frame, in degrees */
  tilt?: number;
  /** Seconds for one gentle drift cycle */
  driftDuration?: number;
}

export const EditorialPhoto: React.FC<EditorialPhotoProps> = ({
  src,
  alt,
  placeholderLabel,
  aspectClass = 'aspect-[3/4]',
  parallaxY,
  caption,
  indexLabel,
  theme = 'dark',
  priority = false,
  delay = 0,
  tilt = 0,
  driftDuration = 10,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const isPlaceholderString =
    !src ||
    src.trim() === '' ||
    (src.startsWith('[') && src.endsWith(']'));

  const showFallback = hasError || isPlaceholderString;

  return (
    <motion.figure
      initial={
        prefersReducedMotion
          ? { opacity: 1 }
          : { opacity: 0, y: 56, scale: 0.88 }
      }
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.2, margin: '-40px 0px -40px 0px' }}
      transition={{
        type: 'spring',
        stiffness: 85,
        damping: 18,
        mass: 0.9,
        delay,
        opacity: { duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] },
      }}
      className="group relative w-full will-change-transform"
    >
      {/* Floating polaroid: drifts gently at its own depth with a coral-glow edge */}
      <div
        className="animate-drift will-change-transform"
        style={{ '--tilt': `${tilt}deg`, animationDuration: `${driftDuration}s`, animationDelay: `${delay}s` } as React.CSSProperties}
      >
      <div
        className={`relative p-2 sm:p-2.5 rounded-[6px] coral-glow transition-[transform,box-shadow] duration-500 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_0_0_1px_rgba(255,138,107,0.45),0_0_40px_-4px_rgba(255,138,107,0.55),0_30px_60px_-24px_rgba(10,4,24,0.85)] ${
          theme === 'dark' ? 'glass-orbit' : 'bg-[#F7EEE3]'
        }`}
      >
      {/* Photo window */}
      <div
        className={`relative w-full overflow-hidden rounded-[3px] ${aspectClass} ${
          theme === 'dark' ? 'bg-[#2B1B4A]' : 'bg-[#F3E2D2]'
        }`}
      >
        {!showFallback ? (
          <motion.div
            style={parallaxY && !prefersReducedMotion ? { y: parallaxY } : undefined}
            className="w-full h-[114%] -mt-[7%] relative"
          >
            <motion.img
              src={src}
              alt={alt}
              referrerPolicy="no-referrer"
              loading={priority ? 'eager' : 'lazy'}
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
              initial={prefersReducedMotion ? { scale: 1 } : { scale: 1.1 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 1.3, delay: delay + 0.05, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full h-full object-cover transition-opacity duration-700 ease-out group-hover:scale-[1.03] ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
            {/* Dusk vignette: plum at the base, a breath of coral light from the horizon */}
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1A1030]/70 via-[#FF8A6B]/[0.04] to-[#1A1030]/20"
              aria-hidden="true"
            />
          </motion.div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[radial-gradient(120%_80%_at_50%_110%,rgba(255,138,107,0.28),transparent_60%),linear-gradient(180deg,#2B1B4A,#1A1030)] text-[#B9A3E3]">
            <ImageIcon className="w-6 h-6 stroke-[1.2] mb-3 opacity-80 text-[#FF8A6B]" />
            <span className="font-serif italic text-lg tracking-wide text-[#F7EEE3]">
              {placeholderLabel}
            </span>
            <span className="mt-1 text-xs tracking-widest uppercase opacity-50">
              Personal Memory Frame
            </span>
          </div>
        )}

        {/* Subtle placeholder indicator overlay in corner */}
        {placeholderLabel && (
          <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] tracking-[0.18em] uppercase text-[#F7EEE3]/80 font-sans">
            <span>{placeholderLabel}</span>
            {indexLabel && <span className="tabular-nums text-[#FFC9A3]/85">{indexLabel}</span>}
          </div>
        )}
      </div>
      </div>
      </div>

      {/* Editorial figure caption beneath image with its own subtle pop-up delay */}
      {caption && (
        <motion.figcaption
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.6, delay: delay + 0.18, ease: [0.16, 1, 0.3, 1] }}
          className={`mt-4 flex items-center justify-between gap-4 text-base font-serif italic tracking-wide ${
            theme === 'dark' ? 'text-[#B9A3E3]/85' : 'text-[#2B1B4A]/70'
          }`}
        >
          <span>{caption}</span>
          {indexLabel && (
            <span className="font-sans not-italic text-[11px] tracking-[0.15em] uppercase text-[#FF8A6B]/80 tabular-nums shrink-0">
              {indexLabel}
            </span>
          )}
        </motion.figcaption>
      )}
    </motion.figure>
  );
};
