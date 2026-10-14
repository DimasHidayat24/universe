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

/** A quiet photograph on dusk: hairline frame, deep shadow, gentle fade-in. */
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
      <div className="p-1.5 sm:p-2 border border-[#F4ECE3]/15 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)]">
        <div className={`relative w-full overflow-hidden bg-[#1C1824] ${aspectClass}`}>
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
              <span className="font-italic-serif text-lg text-[#A99E99]">
                {placeholderLabel}
              </span>
            </div>
          )}
        </div>
      </div>
      {caption && (
        <figcaption className="mt-4 text-center font-italic-serif text-base text-[#A99E99]">
          {caption}
        </figcaption>
      )}
    </motion.figure>
  );
};
