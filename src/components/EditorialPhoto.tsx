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
      {/* Frame container with smooth pop-up + inner scale settle */}
      <div
        className={`relative w-full overflow-hidden transition-transform duration-500 ease-out group-hover:-translate-y-1 ${aspectClass} ${
          theme === 'dark'
            ? 'bg-[#22201E] border border-[#D8CCBC]/15 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.7)]'
            : 'bg-[#EAE3D5] border border-[#171717]/10 shadow-[0_20px_50px_-15px_rgba(23,23,23,0.12)]'
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
            {/* Warm subtle cinematic vignette */}
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#171717]/55 via-transparent to-[#171717]/15"
              aria-hidden="true"
            />
          </motion.div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-[#231F1E] to-[#171717] text-[#D8CCBC]">
            <ImageIcon className="w-6 h-6 stroke-[1.2] mb-3 opacity-60 text-[#744B50]" />
            <span className="font-serif italic text-lg tracking-wide text-[#F5F1EA]">
              {placeholderLabel}
            </span>
            <span className="mt-1 text-xs tracking-widest uppercase opacity-50">
              Personal Memory Frame
            </span>
          </div>
        )}

        {/* Subtle placeholder indicator overlay in corner */}
        {placeholderLabel && (
          <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] tracking-[0.18em] uppercase text-[#F5F1EA]/75 font-sans">
            <span>{placeholderLabel}</span>
            {indexLabel && <span className="tabular-nums opacity-70">{indexLabel}</span>}
          </div>
        )}
      </div>

      {/* Editorial figure caption beneath image with its own subtle pop-up delay */}
      {caption && (
        <motion.figcaption
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.6, delay: delay + 0.18, ease: [0.16, 1, 0.3, 1] }}
          className={`mt-3.5 flex items-center justify-between text-xs font-serif italic tracking-wide ${
            theme === 'dark' ? 'text-[#D8CCBC]/70' : 'text-[#171717]/65'
          }`}
        >
          <span>{caption}</span>
          {indexLabel && (
            <span className="font-sans not-italic text-[11px] tracking-[0.15em] uppercase opacity-60 tabular-nums">
              {indexLabel}
            </span>
          )}
        </motion.figcaption>
      )}
    </motion.figure>
  );
};
