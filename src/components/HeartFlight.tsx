import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

const planeUrl = new URL(`../assets/sky/plane3d.png`, import.meta.url).href;

// Flight path: enters from the left, loops a heart in the sky, exits right.
const PATH =
  'M -80 220 C 150 200, 320 220, 500 246 C 400 180, 330 110, 375 62 C 420 18, 492 34, 500 92 C 508 34, 580 18, 625 62 C 670 110, 600 180, 500 246 C 660 262, 860 190, 1100 120';
const DUR = 8;
const DELAY = 1;
const trail = { duration: DUR, delay: DELAY, ease: 'linear' as const };

/** A 3D-rendered airliner flying a heart-shaped contrail across the hero sky. */
export const HeartFlight: React.FC = () => {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 1000 300" preserveAspectRatio="xMidYMid meet" className="w-full h-full overflow-visible" aria-hidden="true">
      <defs>
        <filter id="contrail-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="9" result="d" />
          <feGaussianBlur in="d" stdDeviation="5" />
        </filter>
        <filter id="contrail-core" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <filter id="plane-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="6" floodColor="#1E3F66" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* dispersed outer vapour */}
      <motion.path d={PATH} fill="none" stroke="white" strokeOpacity={0.55} strokeWidth={16} strokeLinecap="round"
        filter="url(#contrail-soft)" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={trail} />
      {/* fresh twin engine trails */}
      {[-3.5, 3.5].map((dy) => (
        <motion.path key={dy} d={PATH} transform={`translate(0 ${dy})`} fill="none" stroke="white" strokeOpacity={0.95}
          strokeWidth={2.4} strokeLinecap="round" filter="url(#contrail-core)"
          initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={trail} />
      ))}

      {!reduce && (
        <g opacity="0">
          <set attributeName="opacity" to="1" begin={`${DELAY}s`} />
          <animateMotion dur={`${DUR}s`} begin={`${DELAY}s`} fill="freeze" rotate="auto" path={PATH} />
          <g filter="url(#plane-shadow)">
            <image href={planeUrl} x={-44} y={-32} width={88} height={64} preserveAspectRatio="xMidYMid meet">
              {/* slight banking breath for depth */}
              <animateTransform attributeName="transform" type="scale" values="1 1;1 0.9;1 1" dur="2.6s" repeatCount="indefinite" additive="sum" />
            </image>
          </g>
        </g>
      )}
    </svg>
  );
};
