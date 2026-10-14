import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

// Flight path: enters from the left, loops a heart in the middle of the sky, exits right.
const PATH =
  'M -60 210 C 150 190, 320 215, 500 236 C 420 180, 360 120, 400 80 C 435 44, 492 56, 500 100 C 508 56, 565 44, 600 80 C 640 120, 580 180, 500 236 C 660 250, 860 180, 1080 120';
const DUR = 7;

/** A little OLU 1910 plane drawing a heart-shaped contrail across the hero sky. */
export const HeartFlight: React.FC = () => {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 1000 300" preserveAspectRatio="xMidYMid meet" className="w-full h-full overflow-visible" aria-hidden="true">
      <motion.path
        d={PATH}
        fill="none"
        stroke="white"
        strokeOpacity={0.85}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray="1 7"
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: DUR, delay: 1, ease: 'linear' }}
        style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.7))' }}
      />
      {!reduce && (
        <g opacity="0">
          <set attributeName="opacity" to="1" begin="1s" />
          <animateMotion dur={`${DUR}s`} begin="1s" fill="freeze" rotate="auto" path={PATH} />
          <path d="M8 0 L-6 -7 L-3 0 L-6 7 Z M-1 -1 L-4 -12 L1 -12 L4 -1 Z M-1 1 L-4 12 L1 12 L4 1 Z" fill="white" />
        </g>
      )}
    </svg>
  );
};
