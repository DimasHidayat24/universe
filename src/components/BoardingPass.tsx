import React, { useMemo } from 'react';
import { Plane } from 'lucide-react';

interface BoardingPassProps {
  passenger: string;
  date: string;
}

/** Tiny deterministic "QR-like" matrix (decorative), with the three finder squares. */
function useQrMatrix(seed: string, size = 25) {
  return useMemo(() => {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
    const rand = () => {
      h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
      return ((h >>> 0) % 1000) / 1000;
    };
    const inFinder = (x: number, y: number) =>
      (x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8);
    const cells: boolean[][] = [];
    for (let y = 0; y < size; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < size; x++) row.push(inFinder(x, y) ? false : rand() > 0.52);
      cells.push(row);
    }
    return cells;
  }, [seed, size]);
}

const Finder: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <rect x={x} y={y} width={7} height={7} fill="#111" />
    <rect x={x + 1} y={y + 1} width={5} height={5} fill="#fff" />
    <rect x={x + 2} y={y + 2} width={3} height={3} fill="#111" />
  </g>
);

const Field: React.FC<{ label: string; value: string; align?: 'left' | 'right' | 'center'; className?: string }> = ({
  label,
  value,
  align = 'left',
  className = '',
}) => (
  <div className={`min-w-0 ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : ''} ${className}`}>
    <p className="text-[9px] font-bold tracking-[0.08em] uppercase text-white/90">{label}</p>
    <p className="mt-0.5 text-[15px] sm:text-base leading-tight text-white truncate">{value}</p>
  </div>
);

/** An Apple Wallet–style boarding pass. */
export const BoardingPass: React.FC<BoardingPassProps> = ({ passenger, date }) => {
  const size = 25;
  const qr = useQrMatrix(passenger + date, size);
  // "19 Oktober 2025" -> "19 Okt 2025" so the header stays on one line
  const shortDate = date.replace(/([A-Za-z]{3})[A-Za-z]+/, '$1');

  return (
    <div className="relative w-full max-w-[360px] mx-auto">
      {/* soft stacked pass behind, like a Wallet pile */}
      <div
        className="absolute inset-x-5 -top-3 h-10 rounded-t-[20px] bg-[#C9DBEE]"
        aria-hidden="true"
      />
      <article
        aria-label="Boarding pass"
        className="relative overflow-hidden rounded-[20px] bg-gradient-to-b from-[#4F86C2] to-[#2F5F96] text-white shadow-[0_40px_80px_-30px_rgba(40,80,130,0.6),0_2px_6px_rgba(40,80,130,0.15)]"
      >
        {/* sheen */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_60%_at_20%_0%,rgba(255,255,255,0.28),transparent_60%)]" aria-hidden="true" />

        {/* header: logo + carrier, gate/date at right */}
        <div className="relative flex items-start justify-between px-5 pt-4">
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-full bg-white/95 text-[#4A80BC] flex items-center justify-center text-sm" aria-hidden="true">
              ♡
            </span>
            <span className="text-[13px] font-bold tracking-tight">Our Little Universe</span>
          </div>
          <div className="flex gap-4">
            <Field label="Gate" value="♡" align="right" />
            <Field label="Tanggal" value={shortDate} align="right" />
          </div>
        </div>

        {/* route */}
        <div className="relative px-5 pt-6 pb-2 flex items-end justify-between">
          <div>
            <p className="text-[11px] text-white/90">Hari pertama</p>
            <p className="text-[46px] leading-none font-light tracking-tight">AWL</p>
          </div>
          <Plane className="mb-3 h-6 w-6 rotate-45 text-white/90" strokeWidth={1.5} aria-hidden="true" />
          <div className="text-right">
            <p className="text-[11px] text-white/90">Selamanya</p>
            <p className="text-[46px] leading-none font-light tracking-tight">SLM</p>
          </div>
        </div>

        {/* fields */}
        <div className="relative px-5 pt-4 grid grid-cols-1">
          <Field label="Penumpang" value={passenger} />
        </div>
        <div className="relative px-5 pt-4 grid grid-cols-3 gap-3">
          <Field label="Penerbangan" value="OLU 1910" />
          <Field label="Kursi" value="Di sebelahku" align="center" />
          <Field label="Kelas" value="Seumur hidup" align="right" />
        </div>
        <div className="relative px-5 pt-4 grid grid-cols-3 gap-3">
          <Field label="Boarding" value="Kapan pun" />
          <Field label="Grup" value="Kita" align="center" />
          <Field label="Bagasi" value="Kenangan" align="right" />
        </div>

        {/* QR */}
        <div className="relative px-5 pt-7 pb-6 flex flex-col items-center">
          <div className="rounded-xl bg-white p-3 shadow-[0_6px_20px_-8px_rgba(0,0,0,0.35)]">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="h-[132px] w-[132px]"
              shapeRendering="crispEdges"
              role="img"
              aria-label="Kode boarding"
            >
              <rect width={size} height={size} fill="#fff" />
              {qr.map((row, y) =>
                row.map((on, x) => (on ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#111" /> : null)),
              )}
              <Finder x={0} y={0} />
              <Finder x={size - 7} y={0} />
              <Finder x={0} y={size - 7} />
            </svg>
          </div>
          <p className="mt-3 text-[10px] tracking-[0.2em] uppercase text-white/90">Berlaku seumur hidup</p>
        </div>
      </article>
    </div>
  );
};
