import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import { DEFAULT_LETTER_CONFIG } from './config';
import { EditorialPhoto } from './components/EditorialPhoto';
import { AmbientAudioPlayer } from './components/AmbientAudioPlayer';
import { Reveal } from './components/Reveal';

const Kicker: React.FC<{ n: string; label: string }> = ({ n, label }) => (
  <div className="flex items-center justify-center gap-3 text-[11px] tracking-[0.3em] uppercase text-[#7A6C64]">
    <span className="text-[#B0634F]">{n}</span>
    <span className="h-px w-8 bg-[#E5D9CD]" aria-hidden="true" />
    <span>{label}</span>
  </div>
);

const Ornament: React.FC = () => (
  <div className="flex items-center justify-center gap-4 text-[#B0634F]" aria-hidden="true">
    <span className="h-px w-12 bg-[#E5D9CD]" />
    <span className="text-sm">♡</span>
    <span className="h-px w-12 bg-[#E5D9CD]" />
  </div>
);

export default function App() {
  const config = DEFAULT_LETTER_CONFIG;

  const [showOneLastThing, setShowOneLastThing] = useState(false);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 28, restDelta: 0.001 });

  const storyRef = useRef<HTMLElement | null>(null);
  const lastThingRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (showOneLastThing && lastThingRef.current) {
      const t = window.setTimeout(() => {
        lastThingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
      return () => clearTimeout(t);
    }
  }, [showOneLastThing]);

  const storyParts = [
    {
      title: 'Awal yang sederhana',
      body: 'Aku mungkin nggak selalu punya kata-kata yang tepat untuk menjelaskan semuanya. Tapi kalau ada satu hal yang selalu aku syukuri, itu adalah kesempatan untuk mengenal kamu, dekat sama kamu, dan menjalani hari-hari dengan kamu di dalamnya.',
    },
    {
      title: 'Ruang milik kita berdua',
      body: 'Dari obrolan sederhana, tawa yang mungkin nggak penting buat orang lain, sampai momen-momen yang cuma kita berdua yang mengerti, semuanya pelan-pelan menjadi bagian dari hidup yang nggak ingin aku lewatkan begitu saja.',
    },
    {
      title: 'Tempat pulang',
      body: 'Ternyata, bahagia nggak selalu harus tentang sesuatu yang besar. Kadang, cukup tahu kalau di antara banyak hal yang terjadi hari ini, aku masih punya kamu untuk diceritakan semuanya.',
    },
  ];

  const coreMessages = [
    {
      number: 'I',
      title: 'You are appreciated.',
      body: 'Aku menghargai kamu, bahkan untuk hal-hal kecil yang mungkin nggak pernah kamu sadari. Cara kamu hadir, cara kamu bercerita, dan hal-hal sederhana yang membuat kamu menjadi diri kamu sendiri.',
    },
    {
      number: 'II',
      title: "You don't have to be perfect.",
      body: 'Aku nggak berharap kamu selalu kuat, selalu baik-baik saja, atau selalu tahu harus melakukan apa. Aku ingin kamu tahu bahwa kamu juga boleh lelah, boleh punya hari yang buruk, dan boleh menjadi diri kamu sendiri.',
    },
    {
      number: 'III',
      title: 'I choose us.',
      body: 'Aku tahu hubungan bukan cuma tentang perasaan bahagia setiap hari. Akan ada hal yang perlu kita pelajari, perbedaan yang perlu kita pahami, dan keadaan yang perlu kita hadapi bersama. Tapi aku ingin terus belajar menjadi pasangan yang lebih baik buat kamu, bukan hanya lewat kata-kata, tetapi juga lewat caraku memperlakukan kamu.',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#FBF7F2] text-[#2B2320] overflow-x-hidden">
      {/* Hairline reading progress */}
      <div className="fixed top-0 inset-x-0 z-50 h-px pointer-events-none" aria-hidden="true">
        <motion.div className="h-full bg-[#B0634F] origin-left" style={{ scaleX: progress }} />
      </div>

      <main>
        {/* ================= 1. THE OPENING ================= */}
        <section
          id="the-opening"
          className="relative min-h-screen w-full flex items-center px-6 sm:px-12 lg:px-20 py-20"
        >
          <div className="max-w-4xl w-full mx-auto">
            <div className="text-center">
              <Reveal>
                <p className="text-[11px] tracking-[0.32em] uppercase text-[#7A6C64]">
                  For <span className="text-[#B0634F]">{config.partnerName}</span>
                </p>
              </Reveal>

              <Reveal delay={0.1}>
                <h1 className="mt-8 font-serif text-[2.6rem] sm:text-6xl lg:text-[5.2rem] leading-[1.06] tracking-[-0.01em] text-balance">
                  Of all the people in this world, I'm glad it's <span className="font-italic-serif text-[#B0634F]">you.</span>
                </h1>
              </Reveal>

              <Reveal delay={0.2}>
                <p className="mt-8 max-w-md mx-auto text-base sm:text-lg leading-relaxed text-[#7A6C64] font-light">
                  A little place for everything I sometimes find difficult to say.
                </p>
              </Reveal>

              <Reveal delay={0.3} className="mt-12">
                <button
                  type="button"
                  onClick={() => storyRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full border border-[#B0634F] text-[#B0634F] text-xs tracking-[0.24em] uppercase hover:bg-[#B0634F] hover:text-[#FBF7F2] transition-colors duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B0634F]/40 focus-visible:ring-offset-4 focus-visible:ring-offset-[#FBF7F2]"
                >
                  Buka Surat
                </button>
              </Reveal>
            </div>

          </div>
        </section>

        {/* ================= 2. OUR STORY ================= */}
        <section
          ref={storyRef}
          id="our-story"
          className="w-full px-6 sm:px-12 lg:px-20 py-28 sm:py-36 border-t border-[#E5D9CD]"
        >
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <Kicker n="01" label="Our Story" />
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-8 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-center max-w-3xl mx-auto text-balance">
                Somehow, you became my favorite part of every day.
              </h2>
            </Reveal>

            <div className="mt-20 sm:mt-28 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-start">
              <div className="lg:col-span-6 space-y-14">
                {storyParts.map((part, i) => (
                  <Reveal key={part.title} delay={i * 0.05}>
                    <p className="font-italic-serif text-xl text-[#B0634F]">{part.title}</p>
                    <p className="mt-3 text-base sm:text-[1.075rem] leading-[1.9] text-[#2B2320]/85 font-light">
                      {part.body}
                    </p>
                  </Reveal>
                ))}
              </div>

              <div className="lg:col-span-6 grid grid-cols-2 gap-5 sm:gap-6 items-start">
                <EditorialPhoto
                  src={config.memoryPhoto1Url}
                  alt="Momen kenangan berdua"
                  placeholderLabel={config.memoryPhoto1Placeholder}
                  aspectClass="aspect-[3/4]"
                  caption="Sepotong waktu yang selalu ingin aku simpan."
                />
                <div className="pt-16 sm:pt-24">
                  <EditorialPhoto
                    src={config.memoryPhoto2Url}
                    alt="Langkah perjalanan bersama"
                    placeholderLabel={config.memoryPhoto2Placeholder}
                    aspectClass="aspect-[3/4]"
                    caption="Berjalan pelan, tumbuh bersama."
                    delay={0.15}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 3. WHAT I WANT YOU TO KNOW ================= */}
        <section
          id="what-i-want-you-to-know"
          className="w-full bg-[#F4ECE3] px-6 sm:px-12 lg:px-20 py-28 sm:py-36"
        >
          <div className="max-w-3xl mx-auto">
            <Reveal>
              <Kicker n="02" label="What I Want You To Know" />
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-8 font-serif text-4xl sm:text-5xl leading-[1.12] text-center text-balance">
                If there's one thing I hope you never forget…
              </h2>
            </Reveal>

            <div className="mt-20 space-y-16">
              {coreMessages.map((item, i) => (
                <Reveal key={item.number} delay={i * 0.05} className="text-center">
                  <span className="font-italic-serif text-lg text-[#B0634F]">{item.number}</span>
                  <h3 className="mt-2 font-serif text-2xl sm:text-3xl">{item.title}</h3>
                  <p className="mt-5 text-base sm:text-[1.075rem] leading-[1.9] text-[#2B2320]/80 font-light max-w-2xl mx-auto">
                    {item.body}
                  </p>
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-24 sm:mt-32">
              <Ornament />
              <p className="mt-10 font-italic-serif text-2xl sm:text-4xl leading-[1.35] text-center text-balance">
                “It's not just about how much I love you today. It's about how I want to keep loving you, tomorrow and the days after.”
              </p>
            </Reveal>
          </div>
        </section>

        {/* ================= 4. HAPPY ANNIVERSARY ================= */}
        <section
          id="happy-anniversary"
          className="w-full px-6 sm:px-12 lg:px-20 pt-28 sm:pt-36 pb-40"
        >
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <p className="text-[11px] tracking-[0.32em] uppercase text-[#7A6C64]">And here we are</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-6 font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.05] text-balance">
                Happy Anniversary, <span className="font-italic-serif text-[#B0634F]">my love.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 text-xs sm:text-sm tracking-[0.24em] uppercase text-[#7A6C64]">
                {config.relationshipDuration}
                <span className="mx-3 text-[#B0634F]" aria-hidden="true">·</span>
                {config.anniversaryDate}
              </p>
            </Reveal>
          </div>

          <div className="mt-16 sm:mt-20 max-w-md mx-auto">
            <EditorialPhoto
              src={config.closingPhotoUrl}
              alt="Happy Anniversary, My Love"
              placeholderLabel={config.closingPhotoPlaceholder}
              aspectClass="aspect-[4/5]"
              caption={`Bersama kamu, ${config.partnerName}.`}
            />
          </div>

          <div className="mt-20 sm:mt-24 max-w-xl mx-auto space-y-7 text-base sm:text-[1.075rem] leading-[1.95] text-[#2B2320]/85 font-light">
            <Reveal>
              <p className="font-italic-serif text-2xl sm:text-3xl leading-snug text-[#2B2320]">
                Terima kasih sudah menjadi bagian dari perjalanan hidupku.
              </p>
            </Reveal>
            <Reveal>
              <p>
                Terima kasih untuk semua cerita, semua tawa, semua waktu yang kita punya, dan bahkan hal-hal kecil yang mungkin terlihat biasa, tetapi selalu punya tempat tersendiri buat aku.
              </p>
            </Reveal>
            <Reveal>
              <p>
                Aku nggak tahu semua hal yang akan kita temui ke depannya. Tapi aku berharap kita masih punya banyak kesempatan untuk tumbuh, belajar, saling memahami, dan menciptakan cerita-cerita baru yang suatu hari nanti bisa kita kenang sambil tersenyum.
              </p>
            </Reveal>
            <Reveal>
              <p>
                Kalau suatu saat nanti kamu bertanya apa yang membuatku bersyukur tentang perjalanan ini, aku harap jawabannya tetap sederhana:
              </p>
            </Reveal>
            <Reveal>
              <p className="py-8 my-4 border-y border-[#E5D9CD] font-italic-serif text-2xl sm:text-[1.7rem] leading-snug text-center text-[#B0634F]">
                Karena aku pernah bertemu kamu, dan aku mendapatkan kesempatan untuk mencintai kamu.
              </p>
            </Reveal>
            <Reveal>
              <p>Happy anniversary, sayang. I'm so glad it's you.</p>
            </Reveal>
            {config.extraSpecialNote && config.extraSpecialNote.trim() !== '' && (
              <Reveal>
                <p className="pt-2 font-italic-serif text-xl text-[#B0634F]">{config.extraSpecialNote}</p>
              </Reveal>
            )}
          </div>

          <Reveal className="mt-24 text-center">
            <Ornament />
            <p className="mt-10 font-italic-serif text-2xl sm:text-3xl">Always a little more, every day.</p>
            <p className="mt-10 text-[11px] uppercase tracking-[0.3em] text-[#7A6C64]">With all my love,</p>
            <p className="mt-3 font-serif text-3xl">{config.yourName}</p>

            <div className="mt-16">
              <button
                type="button"
                onClick={() => setShowOneLastThing((v) => !v)}
                aria-expanded={showOneLastThing}
                className={`px-8 py-3.5 rounded-full border text-xs tracking-[0.24em] uppercase transition-colors duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B0634F]/40 ${
                  showOneLastThing
                    ? 'border-[#B0634F] bg-[#B0634F] text-[#FBF7F2]'
                    : 'border-[#B0634F] text-[#B0634F] hover:bg-[#B0634F] hover:text-[#FBF7F2]'
                }`}
              >
                One last thing…
              </button>
            </div>

            <div ref={lastThingRef} className="mt-10 min-h-[4rem]">
              <AnimatePresence>
                {showOneLastThing && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-lg mx-auto bg-white px-8 py-10 sm:px-12 sm:py-12 shadow-[0_1px_2px_rgba(60,40,30,0.06),0_30px_60px_-34px_rgba(60,40,30,0.4)]"
                  >
                    <p className="font-italic-serif text-xl sm:text-2xl leading-relaxed text-balance">
                      “Kalau kamu sudah sampai di sini, sini peluk dulu. I love you. More than this little website could ever explain.”
                    </p>
                    <p className="mt-6 text-[#B0634F]" aria-hidden="true">♡</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </section>
      </main>

      <AmbientAudioPlayer
        musicUrl={config.musicUrl}
        musicTitle={config.musicTitle}
      />

    </div>
  );
}
