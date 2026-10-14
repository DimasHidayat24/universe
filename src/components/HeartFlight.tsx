import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

const planeUrl = new URL(`../assets/sky/plane3d.png`, import.meta.url).href;

// Flight: enter low from the left, climb into the left lobe, trace the heart with
// rounded turns (no sharp cusps), then fly back out to the left like skywriting.
const POINTS: [number, number][] = [
  [-180, 250], [80, 235], [260, 210], [330, 150], [345, 80], [400, 36], [462, 46], [500, 94],
  [538, 46], [600, 36], [655, 80], [660, 145], [600, 205], [500, 258], [410, 215], [330, 170],
  [180, 110], [-180, 40],
];

/** Catmull-Rom spline -> cubic béziers, so every join is tangent-continuous. */
function smoothPath(pts: [number, number][]) {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

const PATH = smoothPath(POINTS);
const DUR = 10000;
const DELAY = 900;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) * 0.15 + t * 0.85;

/** A 3D-rendered airliner flying a heart-shaped contrail across the hero sky. */
export const HeartFlight: React.FC = () => {
  const reduce = useReducedMotion();
  const guide = useRef<SVGPathElement>(null);
  const trails = useRef<(SVGPathElement | null)[]>([]);
  const plane = useRef<SVGGElement>(null);

  useEffect(() => {
    const g = guide.current;
    if (!g) return;
    const len = g.getTotalLength();
    const setTrail = (p: number) =>
      trails.current.forEach((t) => {
        if (!t) return;
        t.style.strokeDasharray = `${len}`;
        t.style.strokeDashoffset = `${len * (1 - p)}`;
      });
    if (reduce) { setTrail(1); return; }
    setTrail(0);

    let raf = 0;
    let start = 0;
    let angle: number | null = null;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, Math.max(0, (now - start - DELAY) / DUR));
      const p = ease(t);
      const at = len * p;
      const a = g.getPointAtLength(Math.max(0, at - 6));
      const b = g.getPointAtLength(Math.min(len, at + 6));
      const pt = g.getPointAtLength(at);
      let target = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
      if (angle === null) angle = target;
      while (target - angle > 180) target -= 360;
      while (target - angle < -180) target += 360;
      angle += (target - angle) * 0.18; // ease the heading so turns feel like banking
      setTrail(p);
      if (plane.current) {
        plane.current.setAttribute('transform', `translate(${pt.x.toFixed(2)} ${pt.y.toFixed(2)}) rotate(${angle.toFixed(2)})`);
        plane.current.style.opacity = t > 0 && t < 1 ? '1' : t >= 1 ? '0' : '0';
      }
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  return (
    <svg viewBox="0 0 1000 300" preserveAspectRatio="xMidYMid meet" className="w-full h-full overflow-visible" aria-hidden="true">
      <defs>
        <filter id="contrail-soft" x="-20%" y="-30%" width="140%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="8" result="d" />
          <feGaussianBlur in="d" stdDeviation="5" />
        </filter>
        <filter id="contrail-core" x="-10%" y="-20%" width="120%" height="140%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
        <filter id="plane-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="6" floodColor="#1E3F66" floodOpacity="0.35" />
        </filter>
      </defs>

      <path ref={guide} d={PATH} fill="none" stroke="none" />
      <path ref={(el) => { trails.current[0] = el; }} d={PATH} fill="none" stroke="white" strokeOpacity={0.5}
        strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" filter="url(#contrail-soft)" />
      <path ref={(el) => { trails.current[1] = el; }} d={PATH} fill="none" stroke="white" strokeOpacity={0.95}
        strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" filter="url(#contrail-core)" />

      {!reduce && (
        <g ref={plane} style={{ opacity: 0 }}>
          <g filter="url(#plane-shadow)">
            <image href={planeUrl} x={-44} y={-32} width={88} height={64} />
          </g>
        </g>
      )}
    </svg>
  );
};
