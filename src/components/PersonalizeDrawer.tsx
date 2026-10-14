import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCcw, Check } from 'lucide-react';
import { PersonalLetterConfig, DEFAULT_LETTER_CONFIG } from '../config';

interface PersonalizeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: PersonalLetterConfig;
  onSave: (newConfig: PersonalLetterConfig) => void;
  onReset: () => void;
}

export const PersonalizeDrawer: React.FC<PersonalizeDrawerProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  onReset,
}) => {
  const [draft, setDraft] = useState<PersonalLetterConfig>(config);

  React.useEffect(() => {
    setDraft(config);
  }, [config, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(draft);
    onClose();
  };

  const handleReset = () => {
    setDraft(DEFAULT_LETTER_CONFIG);
    onReset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1A1030]/75 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md bg-gradient-to-b from-[#2B1B4A]/95 to-[#1A1030]/95 backdrop-blur-xl text-[#F7EEE3] border-l border-[#B9A3E3]/25 h-full flex flex-col justify-between overflow-y-auto p-6 sm:p-8 shadow-[-30px_0_80px_-30px_rgba(255,138,107,0.25)]"
            aria-label="Personalize Placeholders"
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#B9A3E3]/20">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#FF8A6B]">
                    Personal Details
                  </p>
                  <h2 className="font-serif text-2xl text-[#F7EEE3] mt-1">
                    Personalize Placeholders
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close panel"
                  className="p-2 rounded-full text-[#B9A3E3] hover:text-[#F7EEE3] hover:bg-[#B9A3E3]/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-[#F7EEE3]/70">
                Ganti placeholder di bawah ini dengan nama pasangan, tanggal anniversary, foto pribadi, dan URL lagu pilihan Anda. Anda juga dapat mengeditnya secara permanen di <code className="text-[#FFC9A3]">src/config.ts</code>.
              </p>

              <form id="personalize-form" onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#B9A3E3] mb-1.5">
                    Nama Pasangan <span className="text-[#B9A3E3]/50">([NAMA PACAR])</span>
                  </label>
                  <input
                    type="text"
                    value={draft.partnerName}
                    onChange={(e) => setDraft({ ...draft, partnerName: e.target.value })}
                    placeholder="[NAMA PACAR]"
                    className="w-full rounded-lg bg-[#1A1030]/70 border border-[#B9A3E3]/25 px-3.5 py-2.5 text-sm text-[#F7EEE3] placeholder:text-[#B9A3E3]/40 transition-colors focus:outline-none focus:border-[#FF8A6B] focus:ring-2 focus:ring-[#FF8A6B]/25"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#B9A3E3] mb-1.5">
                    Nama Anda <span className="text-[#B9A3E3]/50">([NAMA SAYA])</span>
                  </label>
                  <input
                    type="text"
                    value={draft.yourName}
                    onChange={(e) => setDraft({ ...draft, yourName: e.target.value })}
                    placeholder="[NAMA SAYA]"
                    className="w-full rounded-lg bg-[#1A1030]/70 border border-[#B9A3E3]/25 px-3.5 py-2.5 text-sm text-[#F7EEE3] placeholder:text-[#B9A3E3]/40 transition-colors focus:outline-none focus:border-[#FF8A6B] focus:ring-2 focus:ring-[#FF8A6B]/25"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#B9A3E3] mb-1.5">
                      Durasi Hubungan
                    </label>
                    <input
                      type="text"
                      value={draft.relationshipDuration}
                      onChange={(e) =>
                        setDraft({ ...draft, relationshipDuration: e.target.value })
                      }
                      placeholder="[DURASI HUBUNGAN]"
                      className="w-full rounded-lg bg-[#1A1030]/70 border border-[#B9A3E3]/25 px-3.5 py-2.5 text-sm text-[#F7EEE3] placeholder:text-[#B9A3E3]/40 transition-colors focus:outline-none focus:border-[#FF8A6B] focus:ring-2 focus:ring-[#FF8A6B]/25"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#B9A3E3] mb-1.5">
                      Tanggal Anniversary
                    </label>
                    <input
                      type="text"
                      value={draft.anniversaryDate}
                      onChange={(e) =>
                        setDraft({ ...draft, anniversaryDate: e.target.value })
                      }
                      placeholder="[TANGGAL ANNIVERSARY]"
                      className="w-full rounded-lg bg-[#1A1030]/70 border border-[#B9A3E3]/25 px-3.5 py-2.5 text-sm text-[#F7EEE3] placeholder:text-[#B9A3E3]/40 transition-colors focus:outline-none focus:border-[#FF8A6B] focus:ring-2 focus:ring-[#FF8A6B]/25"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#B9A3E3] mb-1.5">
                    URL Musik Pilihan <span className="text-[#B9A3E3]/50">([URL MUSIK])</span>
                  </label>
                  <input
                    type="text"
                    value={draft.musicUrl}
                    onChange={(e) => setDraft({ ...draft, musicUrl: e.target.value })}
                    placeholder="[URL MUSIK] atau https://.../lagu.mp3"
                    className="w-full rounded-lg bg-[#1A1030]/70 border border-[#B9A3E3]/25 px-3.5 py-2.5 text-sm text-[#F7EEE3] placeholder:text-[#B9A3E3]/40 transition-colors focus:outline-none focus:border-[#FF8A6B] focus:ring-2 focus:ring-[#FF8A6B]/25"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#B9A3E3] mb-1.5">
                    URL Foto Kenangan 1 <span className="text-[#B9A3E3]/50">([FOTO KENANGAN 1])</span>
                  </label>
                  <input
                    type="text"
                    value={draft.memoryPhoto1Url}
                    onChange={(e) =>
                      setDraft({ ...draft, memoryPhoto1Url: e.target.value })
                    }
                    placeholder="URL Foto Kenangan 1"
                    className="w-full rounded-lg bg-[#1A1030]/70 border border-[#B9A3E3]/25 px-3.5 py-2.5 text-sm text-[#F7EEE3] placeholder:text-[#B9A3E3]/40 transition-colors focus:outline-none focus:border-[#FF8A6B] focus:ring-2 focus:ring-[#FF8A6B]/25"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#B9A3E3] mb-1.5">
                    URL Foto Penutup Anniversary
                  </label>
                  <input
                    type="text"
                    value={draft.closingPhotoUrl}
                    onChange={(e) =>
                      setDraft({ ...draft, closingPhotoUrl: e.target.value })
                    }
                    placeholder="URL Foto Terbaik Kami"
                    className="w-full rounded-lg bg-[#1A1030]/70 border border-[#B9A3E3]/25 px-3.5 py-2.5 text-sm text-[#F7EEE3] placeholder:text-[#B9A3E3]/40 transition-colors focus:outline-none focus:border-[#FF8A6B] focus:ring-2 focus:ring-[#FF8A6B]/25"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#B9A3E3] mb-1.5">
                    Pesan Khusus Tambahan (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    value={draft.extraSpecialNote}
                    onChange={(e) =>
                      setDraft({ ...draft, extraSpecialNote: e.target.value })
                    }
                    placeholder="Tulis catatan kecil tambahan jika diinginkan..."
                    className="w-full rounded-lg bg-[#1A1030]/70 border border-[#B9A3E3]/25 px-3.5 py-2.5 text-sm text-[#F7EEE3] placeholder:text-[#B9A3E3]/40 transition-colors focus:outline-none focus:border-[#FF8A6B] focus:ring-2 focus:ring-[#FF8A6B]/25"
                  />
                </div>
              </form>
            </div>

            <div className="pt-6 mt-8 border-t border-[#B9A3E3]/20 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-full text-xs uppercase tracking-wider text-[#B9A3E3] hover:text-[#F7EEE3] border border-[#B9A3E3]/30 hover:border-[#B9A3E3]/60 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Default</span>
              </button>

              <button
                type="submit"
                form="personalize-form"
                className="px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold bg-[#FF8A6B] hover:bg-[#FFA084] text-[#1A1030] shadow-[0_0_24px_-6px_rgba(255,138,107,0.7)] transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
