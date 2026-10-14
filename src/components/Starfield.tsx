import React, { useEffect, useRef } from 'react';

interface StarfieldProps {
  className?: string;
  /** Approximate stars per 10,000 px² of canvas area */
  density?: number;
}

interface Star {
  x: number;
  y: number;
  r: number;
  color: string;
  phase: number;
  speed: number;
  base: number;
}

// Lilac Dust, Peach Glow and Moon Cream stars
const STAR_COLORS = ['185,163,227', '185,163,227', '255,201,163', '247,238,227'];

/**
 * Lightweight canvas starfield with lilac & peach twinkling stars.
 * - Caps device pixel ratio and frame rate (~30fps) to stay light.
 * - Pauses when off-screen or when the tab is hidden.
 * - Draws a single static frame when the user prefers reduced motion.
 */
export const Starfield: React.FC<StarfieldProps> = ({
  className = '',
  density = 1.1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let stars: Star[] = [];
    let width = 0;
    let height = 0;
    let rafId: number | null = null;
    let lastFrame = 0;
    let isVisible = true;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(260, Math.round(((width * height) / 10000) * density));
      stars = Array.from({ length: count }, () => {
        // Fewer stars near the bottom where the horizon glows
        const y = Math.pow(Math.random(), 1.35) * height;
        const big = Math.random() < 0.08;
        return {
          x: Math.random() * width,
          y,
          r: big ? 1.1 + Math.random() * 0.9 : 0.35 + Math.random() * 0.75,
          color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
          phase: Math.random() * Math.PI * 2,
          speed: 0.6 + Math.random() * 1.6,
          base: 0.35 + Math.random() * 0.5,
        };
      });
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        const tw = reduceMotion
          ? s.base
          : s.base + Math.sin(t * 0.001 * s.speed + s.phase) * 0.35;
        const alpha = Math.max(0.05, Math.min(1, tw));
        ctx.beginPath();
        ctx.fillStyle = `rgba(${s.color},${alpha})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.r > 1.1) {
          // soft halo for the brightest stars
          ctx.beginPath();
          ctx.fillStyle = `rgba(${s.color},${alpha * 0.18})`;
          ctx.arc(s.x, s.y, s.r * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const loop = (t: number) => {
      rafId = null;
      if (!isVisible || document.hidden) return;
      if (t - lastFrame > 33) {
        lastFrame = t;
        draw(t);
      }
      rafId = requestAnimationFrame(loop);
    };

    const start = () => {
      if (reduceMotion) {
        draw(0);
        return;
      }
      if (rafId === null) rafId = requestAnimationFrame(loop);
    };

    build();
    start();

    const resizeObserver = new ResizeObserver(() => {
      build();
      draw(performance.now());
    });
    resizeObserver.observe(canvas);

    const io = new IntersectionObserver((entries) => {
      isVisible = entries[0]?.isIntersecting ?? true;
      if (isVisible) start();
    });
    io.observe(canvas);

    const onVisibility = () => {
      if (!document.hidden) start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none block w-full h-full ${className}`}
      aria-hidden="true"
    />
  );
};
