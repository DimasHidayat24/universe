import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import skyDay from '../assets/sky/sky-day.jpg';
import cloudWisps from '../assets/sky/cloud-wisps.jpg';

interface OpeningGateProps {
  open: boolean;
  name: string;
  onOpen: () => void;
}

/**
 * Full-screen opening card. A single tap opens the site like a gift and,
 * because it is a real user gesture, also lets the song start on phones.
 */
export const OpeningGate: React.FC<OpeningGateProps> = ({ open, name, onOpen }) => {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {!open && (
        <motion.div
          key="gate"
          role="dialog"
          aria-modal="true"
          aria-label={`Untuk ${name}`}
          className="fixed inset-0 z-[80] overflow-hidden bg-[#FAF8F2]"
          initial={{ opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: '-6%', filter: 'blur(6px)' }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <img src={skyDay} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover object-[50%_30%] scale-105" />
          <div className="absolute inset-0 pointer-events-none mix-blend-screen" aria-hidden="true">
            <img src={cloudWisps} alt="" className="drift-a absolute top-[12%] left-[-10%] w-[120%] opacity-[0.22]" />
            <img src={cloudWisps} alt="" className="drift-b absolute top-[48%] left-[-15%] w-[130%] opacity-[0.14] scale-x-[-1]" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#2F5F96]/60 via-[#4A80BC]/35 to-[#FAF8F2]/90" aria-hidden="true" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_45%,rgba(47,95,150,0.5),transparent_75%)]" aria-hidden="true" />

          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="text-[11px] tracking-[0.36em] uppercase text-white/90 drop-shadow-[0_1px_8px_rgba(28,60,100,0.6)]"
            >
              Untuk
            </motion.p>
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 16, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.2, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 font-italic-serif text-6xl sm:text-7xl lg:text-8xl leading-none bg-gradient-to-r from-white to-[#F6D5CB] bg-clip-text text-transparent drop-shadow-[0_2px_24px_rgba(28,60,100,0.45)] pb-2"
            >
              {name}
            </motion.h1>
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.1 }}
              className="mt-6 max-w-xs text-base sm:text-lg leading-relaxed text-white drop-shadow-[0_1px_12px_rgba(28,60,100,0.6)]"
            >
              Ada sesuatu kecil yang aku buat, khusus buat kamu.
            </motion.p>

            <motion.button
              type="button"
              onClick={onOpen}
              initial={reduce ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
              whileTap={{ scale: 0.96 }}
              className="group mt-12 relative inline-flex items-center gap-3 px-9 py-4 rounded-full bg-[#1C1B19] text-white text-xs tracking-[0.28em] uppercase shadow-[0_20px_40px_-18px_rgba(20,30,50,0.6)] hover:bg-black cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              {!reduce && (
                <span className="absolute inset-0 rounded-full ring-1 ring-white/40 animate-ping [animation-duration:2.4s]" aria-hidden="true" />
              )}
              <span className="text-[#F6D5CB] text-base leading-none" aria-hidden="true">♡</span>
              Tap untuk buka
            </motion.button>

            <motion.p
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 2.2 }}
              className="absolute bottom-8 inset-x-0 text-[10px] tracking-[0.3em] uppercase text-[#4A4640]"
            >
              Nyalakan suaranya ya ♪
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
