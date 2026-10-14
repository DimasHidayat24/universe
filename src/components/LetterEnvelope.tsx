import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

type Phase = 'closed' | 'opening' | 'open';

/** Wax seal with the couple's initials, pressed in deep crimson. */
const WaxSeal: React.FC<{ initials: string }> = ({ initials }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_6px_10px_rgba(80,10,15,0.45)]" aria-hidden="true">
    <defs>
      <radialGradient id="wax" cx="38%" cy="32%" r="75%">
        <stop offset="0%" stopColor="#C2343B" />
        <stop offset="55%" stopColor="#8E1A22" />
        <stop offset="100%" stopColor="#5C0E14" />
      </radialGradient>
    </defs>
    {/* irregular melted rim */}
    <path
      d="M50 3c7 0 9 4 15 5s11-1 15 4 1 10 4 15 8 7 8 14-5 9-5 15 4 10 1 16-9 6-13 10-5 10-12 12-10-2-14-2-8 4-14 3-7-6-12-8-11-2-14-7 1-10-1-15-7-8-7-15 5-9 6-15-3-11 1-16 10-3 14-7 5-9 12-10 9 3 16 3z"
      fill="url(#wax)"
    />
    <circle cx="50" cy="51" r="30" fill="none" stroke="#5C0E14" strokeOpacity="0.55" strokeWidth="2.5" />
    <circle cx="50" cy="51" r="26" fill="none" stroke="#E07A78" strokeOpacity="0.35" strokeWidth="1" />
    <text
      x="50"
      y="60"
      textAnchor="middle"
      fontFamily="'Pinyon Script', cursive"
      fontSize="26"
      fill="#5C0E14"
      fillOpacity="0.85"
      style={{ filter: 'drop-shadow(0 1px 0 rgba(255,160,150,0.35))' }}
    >
      {initials}
    </text>
  </svg>
);

/**
 * A sealed ivory envelope. Tapping the seal lifts the flap, the letter slides out,
 * then unfolds into a full parchment page written in copperplate script.
 */
export const LetterEnvelope: React.FC<{
  to: string;
  initials: string;
  children: React.ReactNode;
}> = ({ to, initials, children }) => {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('closed');
  const letterRef = useRef<HTMLDivElement | null>(null);

  const open = () => {
    if (phase !== 'closed') return;
    setPhase('opening');
    window.setTimeout(() => setPhase('open'), reduce ? 50 : 1700);
  };

  useEffect(() => {
    if (phase === 'open' && letterRef.current) {
      const t = window.setTimeout(
        () => letterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        200,
      );
      return () => clearTimeout(t);
    }
  }, [phase]);

  const flapOpen = phase !== 'closed';

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {phase !== 'open' ? (
          <motion.div
            key="envelope"
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.5 } }}
            className="flex flex-col items-center"
          >
            <button
              type="button"
              onClick={open}
              aria-label={`Buka surat untuk ${to}`}
              className="group relative w-full max-w-[560px] aspect-[3/2] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E1A22]/40 rounded-md [perspective:1400px]"
            >
              {/* back of the envelope (inside) */}
              <div className="absolute inset-0 rounded-md bg-[#E9DCC4] shadow-[0_40px_80px_-35px_rgba(70,45,20,0.55)]" />

              {/* the letter tucked inside */}
              <motion.div
                className="absolute left-[6%] right-[6%] top-[8%] h-[80%] rounded-sm paper shadow-md"
                animate={{ y: flapOpen ? (reduce ? '0%' : '-42%') : '0%' }}
                transition={{ delay: flapOpen ? 0.55 : 0, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                style={{ zIndex: 2 }}
              >
                <p className="pt-[7%] text-center font-letter text-2xl sm:text-3xl text-[#3B2A1E]/80">
                  My dearest,
                </p>
              </motion.div>

              {/* front pocket: left, right and bottom folds */}
              <div
                className="absolute inset-0 rounded-md bg-[#F3EADB]"
                style={{ clipPath: 'polygon(0 0, 50% 55%, 0 100%)', zIndex: 3 }}
              />
              <div
                className="absolute inset-0 rounded-md bg-[#F3EADB]"
                style={{ clipPath: 'polygon(100% 0, 50% 55%, 100% 100%)', zIndex: 3 }}
              />
              <div
                className="absolute inset-0 rounded-md bg-gradient-to-t from-[#EFE3CF] to-[#F7F0E3]"
                style={{ clipPath: 'polygon(0 100%, 50% 48%, 100% 100%)', zIndex: 4 }}
              />
              {/* address line on the front */}
              <div className="absolute inset-x-0 bottom-[9%] text-center pointer-events-none" style={{ zIndex: 5 }}>
                <p className="font-letter text-xl sm:text-2xl text-[#3B2A1E]/75">To {to}</p>
              </div>

              {/* top flap, hinged at the top edge */}
              <motion.div
                className="absolute inset-x-0 top-0 h-[58%] origin-top [transform-style:preserve-3d]"
                animate={{ rotateX: flapOpen ? 180 : 0 }}
                transition={{ duration: reduce ? 0 : 0.7, ease: [0.65, 0, 0.35, 1] }}
                style={{ zIndex: flapOpen ? 1 : 6 }}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-b from-[#F7F0E3] to-[#E8D9BF] [backface-visibility:hidden]"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
                />
                <div
                  className="absolute inset-0 bg-[#E2D2B6] [backface-visibility:hidden] [transform:rotateX(180deg)]"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
                />
              </motion.div>

              {/* wax seal at the tip of the flap */}
              <motion.div
                className="absolute left-1/2 top-[58%] w-20 h-20 sm:w-24 sm:h-24 -translate-x-1/2 -translate-y-1/2"
                animate={flapOpen ? { opacity: 0, scale: 0.6, rotate: -20 } : { opacity: 1, scale: 1, rotate: 0 }}
                whileHover={flapOpen ? undefined : { scale: 1.06 }}
                transition={{ duration: 0.45 }}
                style={{ zIndex: 7 }}
              >
                <WaxSeal initials={initials} />
              </motion.div>
            </button>

            <p className="mt-8 text-[11px] tracking-[0.3em] uppercase text-[#6E6A64]">
              {phase === 'closed' ? 'Ketuk segelnya untuk membuka' : 'Membuka surat…'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            ref={letterRef}
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="scroll-mt-10 relative mx-auto max-w-2xl paper rounded-[3px] px-7 py-14 sm:px-16 sm:py-20 shadow-[0_50px_100px_-45px_rgba(70,45,20,0.6)]"
          >
            {/* faint fold lines */}
            <div className="pointer-events-none absolute inset-x-0 top-1/3 h-px bg-[#3B2A1E]/[0.06]" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-x-0 top-2/3 h-px bg-[#3B2A1E]/[0.06]" aria-hidden="true" />
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
