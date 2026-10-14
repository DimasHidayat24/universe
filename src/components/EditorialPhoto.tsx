import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface EditorialPhotoProps {
  src: string;
  alt: string;
  placeholderLabel: string;
  aspectClass?: string;
  caption?: string;
  priority?: boolean;
  delay?: number;
}

/** A soft white-card photograph: rounded frame, airy shadow, gentle fade-in. */
export const EditorialPhoto: React.FC<EditorialPhotoProps> = ({
  src,
  alt,
  placeholderLabel,
  aspectClass = 'aspect-[3/4]',
  caption,
  priority = false,
  delay = 0,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const reduce = useReducedMotion();

  const isPlaceholder =
    !src || src.trim() === '' || (src.startsWith('[') && src.endsWith(']'));
  const showFallback = hasError || isPlaceholder;

  return (
    <motion.figure
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      <div className="p-2 sm:p-2.5 rounded-3xl bg-white border border-[#1C1B19]/6 shadow-[0_30px_60px_-34px_rgba(40,70,110,0.4)]">
        <div className={`relative w-full overflow-hidden rounded-[1.1rem] bg-[#EEF3F8] ${aspectClass}`}>
          {!showFallback ? (
            <img
              src={src}
              alt={alt}
              loading={priority ? 'eager' : 'lazy'}
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
              className={`w-full h-full object-cover transition-opacity duration-1000 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-8 text-center">
              <span className="font-italic-serif text-lg text-[#6E6A64]">
                {placeholderLabel}
              </span>
            </div>
          )}
        </div>
      </div>
      {caption && (
        <figcaption className="mt-4 text-center font-italic-serif text-base text-[#6E6A64]">
          {caption}
        </figcaption>
      )}
    </motion.figure>
  );
};
