import React from 'react';
import { motion, useReducedMotion, Variants } from 'motion/react';

interface ScrollPopUpProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Initial vertical offset in pixels */
  yOffset?: number;
  /** Initial scale before popping up */
  initialScale?: number;
  /** Whether animation should only play once or re-trigger smoothly on scroll */
  once?: boolean;
  /** Amount of element visible before triggering (0 to 1) */
  amount?: number;
}

/**
 * Smooth spring-based pop-up container triggered on scroll.
 * Uses only compositor properties (transform: translateY, scale, and opacity).
 */
export const ScrollPopUp: React.FC<ScrollPopUpProps> = ({
  children,
  className = '',
  delay = 0,
  yOffset = 44,
  initialScale = 0.92,
  once = false,
  amount = 0.2,
}) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: yOffset,
        scale: initialScale,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      viewport={{
        once,
        amount,
        margin: '-40px 0px -40px 0px',
      }}
      transition={{
        type: 'spring',
        stiffness: 95,
        damping: 18,
        mass: 0.85,
        delay,
        opacity: {
          duration: 0.55,
          delay,
          ease: [0.16, 1, 0.3, 1],
        },
      }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
};

interface StaggeredHeadlinePopUpProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  className?: string;
  delay?: number;
  once?: boolean;
}

/**
 * Splits a headline into words and smoothly pops each word up with spring physics
 * as the headline scrolls into the viewport.
 */
export const StaggeredHeadlinePopUp: React.FC<StaggeredHeadlinePopUpProps> = ({
  text,
  as: Tag = 'h2',
  className = '',
  delay = 0,
  once = false,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const words = text.split(' ');

  if (prefersReducedMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: delay,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 36,
      scale: 0.88,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 110,
        damping: 17,
        mass: 0.8,
      },
    },
  };

  const MotionTag = motion[Tag];

  return (
    <MotionTag
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.25, margin: '-40px 0px -40px 0px' }}
      className={className}
    >
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="inline-block overflow-visible mr-[0.26em] last:mr-0"
        >
          <motion.span
            variants={wordVariants}
            className="inline-block will-change-transform"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
};
