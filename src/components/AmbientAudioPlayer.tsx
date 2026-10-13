import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Music, SlidersHorizontal } from 'lucide-react';

interface AmbientAudioPlayerProps {
  musicUrl: string;
  musicTitle?: string;
  onOpenCustomizer: () => void;
}

/**
 * Web Audio API gentle ambient warm piano/pad synthesizer fallback
 * Used when musicUrl is still set to the placeholder "[URL MUSIK]" so the
 * play/pause button works immediately and creates an intimate atmosphere
 * without requiring an external MP3 or auto-playing on load.
 */
class IntimateAmbientSynth {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private intervalId: number | null = null;
  private masterGain: GainNode | null = null;

  public start() {
    if (this.isPlaying) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 2.5);
    this.masterGain.connect(this.ctx.destination);

    this.isPlaying = true;

    // Warm romantic progression notes (Fmaj7 - Cmaj7 - Dm7 - Am7 in Hz)
    const chords = [
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [130.81, 196.0, 246.94, 329.63], // Cmaj7
      [146.83, 220.0, 261.63, 349.23], // Dm7
      [130.81, 196.0, 261.63, 392.0],  // Cadd9
    ];
    let chordIndex = 0;

    const playChord = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const now = this.ctx.currentTime;
      const notes = chords[chordIndex % chords.length];
      chordIndex++;

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = idx === 0 ? 'sine' : 'triangle';
        // Slight arpeggiated delay for human warmth
        const startTime = now + idx * 0.35;
        const duration = 5.2;

        osc.frequency.setValueAtTime(freq, startTime);

        noteGain.gain.setValueAtTime(0.0001, startTime);
        noteGain.gain.exponentialRampToValueAtTime(0.15 / notes.length, startTime + 1.1);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.1);
      });
    };

    playChord();
    this.intervalId = window.setInterval(playChord, 4800);
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.ctx && this.masterGain) {
      try {
        const now = this.ctx.currentTime;
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      } catch {
        // Ignore if context closed
      }
    }
  }
}

export const AmbientAudioPlayer: React.FC<AmbientAudioPlayerProps> = ({
  musicUrl,
  onOpenCustomizer,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<IntimateAmbientSynth | null>(null);

  const isPlaceholderUrl =
    !musicUrl ||
    musicUrl.trim() === '' ||
    musicUrl.trim() === '[URL MUSIK]';

  useEffect(() => {
    synthRef.current = new IntimateAmbientSynth();
    return () => {
      synthRef.current?.stop();
    };
  }, []);

  // Reset playback if musicUrl changes
  useEffect(() => {
    setAudioError(false);
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      synthRef.current?.stop();
      setIsPlaying(false);
    }
  }, [musicUrl]);

  const togglePlay = async () => {
    if (isPlaying) {
      if (!isPlaceholderUrl && audioRef.current) {
        audioRef.current.pause();
      } else {
        synthRef.current?.stop();
      }
      setIsPlaying(false);
      return;
    }

    // Start playing
    if (!isPlaceholderUrl && !audioError && audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        // Fallback to warm ambient synth if custom URL fails or is invalid
        setAudioError(true);
        synthRef.current?.start();
        setIsPlaying(true);
      }
    } else {
      synthRef.current?.start();
      setIsPlaying(true);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
      {!isPlaceholderUrl && (
        <audio
          ref={audioRef}
          src={musicUrl}
          loop
          preload="none"
          onError={() => setAudioError(true)}
        />
      )}

      {/* Subtle button to customize placeholders ([NAMA PACAR], [URL MUSIK], etc.) */}
      <button
        type="button"
        onClick={onOpenCustomizer}
        title="Sesuaikan Placeholder ([NAMA PACAR], [URL MUSIK], Foto, dll.)"
        aria-label="Sesuaikan Placeholder Personal"
        className="h-10 px-3.5 bg-[#171717]/85 hover:bg-[#171717] text-[#D8CCBC] hover:text-[#F5F1EA] border border-[#D8CCBC]/20 backdrop-blur-md transition-colors duration-200 flex items-center gap-2 text-xs tracking-wider uppercase whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D8CCBC]"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 stroke-[1.5]" />
        <span className="hidden sm:inline">Customize</span>
      </button>

      {/* Minimalist Play/Pause Music Control */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
        title={
          isPlaceholderUrl
            ? 'Ambient Melody ([URL MUSIK])'
            : 'Play / Pause Music'
        }
        className="h-10 px-4 bg-[#171717]/85 hover:bg-[#171717] text-[#F5F1EA] border border-[#D8CCBC]/20 backdrop-blur-md transition-colors duration-200 flex items-center gap-2.5 text-xs tracking-wider uppercase whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D8CCBC]"
      >
        {isPlaying ? (
          <Volume2 className="w-3.5 h-3.5 text-[#D8CCBC] stroke-[1.5]" />
        ) : (
          <VolumeX className="w-3.5 h-3.5 text-[#D8CCBC]/60 stroke-[1.5]" />
        )}
        <span>{isPlaying ? 'Pause' : 'Play'}</span>
        <span aria-hidden="true" className="text-[#D8CCBC]/40">·</span>
        <span className="text-[11px] text-[#D8CCBC]/75 font-serif italic normal-case tracking-normal flex items-center gap-1">
          <Music className="w-3 h-3 inline opacity-60" />
          {isPlaceholderUrl ? '[URL MUSIK]' : 'Audio'}
        </span>
      </button>
    </div>
  );
};
