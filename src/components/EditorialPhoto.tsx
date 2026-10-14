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

/** A quiet, framed photograph: thin ivory mat, soft shadow, gentle fade-in. */
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
      <div className="bg-white p-2.5 sm:p-3 shadow-[0_1px_2px_rgba(60,40,30,0.06),0_24px_48px_-28px_rgba(60,40,30,0.35)]">
        <div className={`relative w-full overflow-hidden bg-[#F4ECE3] ${aspectClass}`}>
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
              <span className="font-italic-serif text-lg text-[#7A6C64]">
                {placeholderLabel}
              </span>
            </div>
          )}
        </div>
      </div>
      {caption && (
        <figcaption className="mt-4 text-center font-italic-serif text-base text-[#7A6C64]">
          {caption}
        </figcaption>
      )}
    </motion.figure>
  );
};
