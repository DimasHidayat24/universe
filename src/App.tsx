import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform, AnimatePresence, useReducedMotion } from 'motion/react';
import { DEFAULT_LETTER_CONFIG } from './config';
import { EditorialPhoto } from './components/EditorialPhoto';
import { AmbientAudioPlayer } from './components/AmbientAudioPlayer';
import { Reveal } from './components/Reveal';
import skyDusk from './assets/sky/sky-dusk.jpg';
import cloudWisps from './assets/sky/cloud-wisps.jpg';
import cloudBank from './assets/sky/cloud-bank.jpg';

const NAV = [
  { id: 'cerita', label: 'Cerita', n: '01' },
  { id: 'pesan', label: 'Pesan', n: '02' },
  { id: 'perjalanan', label: 'Perjalanan', n: '03' },
  { id: 'surat', label: 'Surat', n: '04' },
];

const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

const Kicker: React.FC<{ n: string; label: string; className?: string }> = ({ n, label, className = '' }) => (
  <div className={`flex items-center gap-3 text-[11px] tracking-[0.3em] uppercase text-[#A99E99] ${className}`}>
    <span className="text-[#D9B98C]">{n}</span>
    <span className="h-px w-8 bg-[#F4ECE3]/20" aria-hidden="true" />
    <span>{label}</span>
  </div>
);

const PassField: React.FC<{ label: string; value: string; big?: boolean }> = ({ label, value, big }) => (
  <div>
    <p className="text-[10px] tracking-[0.28em] uppercase text-[#A99E99]">{label}</p>
    <p className={`mt-1.5 ${big ? 'font-serif text-2xl sm:text-3xl' : 'text-sm sm:text-base'} text-[#F4ECE3]`}>{value}</p>
  </div>
);

function daysTogether(iso: string) {
  const start = new Date(`${iso}T00:00:00+07:00`).getTime();
  return Math.max(0, Math.floor((Date.now() - start) / 86400000));
}

export default function App() {
  const config = DEFAULT_LETTER_CONFIG;
  const reduce = useReducedMotion();

  const [showOneLastThing, setShowOneLastThing] = useState(false);
  const [activeMsg, setActiveMsg] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [days] = useState(() => daysTogether(config.startDateISO));

  const { scrollYProgress, scrollY } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 28, restDelta: 0.001 });

  // Hero parallax: the sky sinks slowly, the cloud bank rises, the text lifts away.
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const skyY = useTransform(heroP, [0, 1], ['0%', reduce ? '0%' : '18%']);
  const bankY = useTransform(heroP, [0, 1], ['0%', reduce ? '0%' : '-22%']);
  const textY = useTransform(heroP, [0, 1], ['0%', reduce ? '0%' : '-35%']);
  const textO = useTransform(heroP, [0, 0.7], [1, 0]);

  const lastThingRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => scrollY.on('change', (v) => setScrolled(v > 40)), [scrollY]);

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
    <div className="relative min-h-screen bg-[#14121A] text-[#F4ECE3] overflow-x-hidden">
      {/* Hairline reading progress */}
      <div className="fixed top-0 inset-x-0 z-[60] h-px pointer-events-none" aria-hidden="true">
        <motion.div className="h-full bg-[#D9B98C] origin-left" style={{ scaleX: progress }} />
      </div>

      {/* ================= NAV ================= */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-[background-color,border-color] duration-500 border-b ${
          scrolled ? 'bg-[#14121A]/70 backdrop-blur-md border-[#F4ECE3]/10' : 'bg-transparent border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 h-16 sm:h-20 flex items-center justify-between gap-6">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-serif text-sm sm:text-base tracking-[0.32em] uppercase cursor-pointer"
          >
            Our Little Universe
          </button>
          <button
            type="button"
            onClick={() => scrollToId('cerita')}
            className="px-5 py-2.5 rounded-full border border-[#F4ECE3]/40 text-[11px] tracking-[0.22em] uppercase hover:bg-[#F4ECE3] hover:text-[#14121A] transition-colors duration-300 cursor-pointer"
          >
            Buka Surat
          </button>
        </div>
      </header>

      <main>
        {/* ================= HERO: ABOVE THE CLOUDS ================= */}
        <section ref={heroRef} id="hero" className="relative h-[100svh] min-h-[620px] w-full overflow-hidden">
          <motion.img
            src={skyDusk}
            alt=""
            aria-hidden="true"
            style={{ y: skyY }}
            className="absolute inset-0 w-full h-[115%] object-cover object-[50%_40%]"
          />
          {/* drifting wisps, screen-blended so only the light shows */}
          <div className="absolute inset-0 pointer-events-none mix-blend-screen" aria-hidden="true">
            <img src={cloudWisps} alt="" className="drift-a absolute top-[6%] left-[-10%] w-[120%] opacity-[0.18]" />
            <img src={cloudWisps} alt="" className="drift-b absolute top-[28%] left-[-15%] w-[130%] opacity-[0.12] scale-x-[-1]" />
            <img src={cloudWisps} alt="" className="drift-c absolute top-[46%] left-[-5%] w-[110%] opacity-[0.10]" />
          </div>
          <motion.img
            src={cloudBank}
            alt=""
            aria-hidden="true"
            style={{ y: bankY }}
            className="absolute -bottom-[8%] left-0 w-full h-[70%] object-cover object-bottom mix-blend-screen opacity-80 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#14121A]/40 via-transparent to-[#14121A]" aria-hidden="true" />

          <motion.div
            style={{ y: textY, opacity: textO }}
            className="relative z-10 h-full max-w-5xl mx-auto px-6 flex flex-col items-center justify-center text-center"
          >
            <Reveal>
              <p className="text-[11px] tracking-[0.32em] uppercase text-[#F4ECE3]/80">
                For <span className="text-[#D9B98C]">{config.partnerName}</span>
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="mt-8 font-serif text-[2.6rem] sm:text-6xl lg:text-[5.4rem] leading-[1.04] tracking-[-0.01em] text-balance drop-shadow-[0_2px_24px_rgba(20,18,26,0.45)]">
                Of all the people in this world, I'm glad it's{' '}
                <span className="font-italic-serif text-[#E0A08B]">you.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-8 max-w-md mx-auto text-base sm:text-lg leading-relaxed text-[#F4ECE3]/80 font-light">
                A little place for everything I sometimes find difficult to say.
              </p>
            </Reveal>
          </motion.div>

          <button
            type="button"
            onClick={() => scrollToId('tentang')}
            className="absolute z-10 bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-[10px] tracking-[0.32em] uppercase text-[#F4ECE3]/70 hover:text-[#F4ECE3] cursor-pointer"
          >
            Scroll untuk mulai
            <span className="h-10 w-px bg-gradient-to-b from-[#F4ECE3]/70 to-transparent" aria-hidden="true" />
          </button>
        </section>

        {/* ================= INTRO STATEMENT ================= */}
        <section id="tentang" className="px-6 sm:px-10 py-28 sm:py-40">
          <Reveal className="max-w-4xl mx-auto">
            <p className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.2] text-balance">
              Di atas segalanya, dunia jadi tenang.{' '}
              <span className="text-[#A99E99]">
                Website kecil ini dibuat untuk satu orang, dan setiap bagiannya cuma tentang{' '}
              </span>
              <span className="font-italic-serif text-[#E0A08B]">kamu.</span>
            </p>
          </Reveal>
        </section>

        {/* ================= 01 OUR STORY ================= */}
        <section id="cerita" className="px-6 sm:px-10 pb-28 sm:pb-40 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <div className="border-t hairline pt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
              <Reveal className="lg:col-span-4">
                <Kicker n="01" label="Our Story" />
              </Reveal>
              <Reveal delay={0.1} className="lg:col-span-8">
                <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.08] text-balance">
                  Somehow, you became my{' '}
                  <span className="font-italic-serif text-[#D9B98C]">favorite part</span> of every day.
                </h2>
              </Reveal>
            </div>

            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10">
              {storyParts.map((part, i) => (
                <Reveal key={part.title} delay={i * 0.08} className="border-t hairline pt-6">
                  <p className="text-[10px] tracking-[0.3em] text-[#D9B98C]">0{i + 1}</p>
                  <h3 className="mt-4 font-italic-serif text-2xl text-[#F4ECE3]">{part.title}</h3>
                  <p className="mt-4 text-[0.98rem] leading-[1.9] text-[#F4ECE3]/75 font-light">{part.body}</p>
                </Reveal>
              ))}
            </div>

            <div className="mt-24 sm:mt-32 grid grid-cols-2 gap-5 sm:gap-10 max-w-4xl mx-auto items-start">
              <EditorialPhoto
                src={config.memoryPhoto1Url}
                alt="Momen kenangan berdua"
                placeholderLabel={config.memoryPhoto1Placeholder}
                aspectClass="aspect-[3/4]"
                caption="Sepotong waktu yang selalu ingin aku simpan."
              />
              <div className="pt-16 sm:pt-28">
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
        </section>

        {/* ================= 02 WHAT I WANT YOU TO KNOW ================= */}
        <section id="pesan" className="bg-[#1C1824] px-6 sm:px-10 py-28 sm:py-40 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <Kicker n="02" label="What I Want You To Know" />
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-8 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.08] max-w-3xl text-balance">
                If there's one thing I hope you{' '}
                <span className="font-italic-serif text-[#E0A08B]">never forget</span>…
              </h2>
            </Reveal>

            <div className="mt-16 sm:mt-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
              <div className="lg:col-span-5" role="tablist" aria-label="Pesan">
                {coreMessages.map((item, i) => {
                  const active = i === activeMsg;
                  return (
                    <button
                      key={item.number}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveMsg(i)}
                      className={`w-full text-left flex items-baseline gap-5 py-6 border-t hairline cursor-pointer transition-colors ${
                        active ? 'text-[#F4ECE3]' : 'text-[#F4ECE3]/40 hover:text-[#F4ECE3]/70'
                      }`}
                    >
                      <span className={`font-italic-serif text-lg w-8 ${active ? 'text-[#D9B98C]' : ''}`}>{item.number}</span>
                      <span className="font-serif text-2xl sm:text-3xl">{item.title}</span>
                    </button>
                  );
                })}
                <div className="border-t hairline" />
              </div>

              <div className="lg:col-span-7 lg:pl-10 lg:border-l hairline min-h-[16rem] flex items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeMsg}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="text-[10px] tracking-[0.3em] uppercase text-[#D9B98C]">
                      Pesan {coreMessages[activeMsg].number}
                    </p>
                    <p className="mt-5 text-lg sm:text-xl leading-[1.85] text-[#F4ECE3]/85 font-light">
                      {coreMessages[activeMsg].body}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <Reveal className="mt-28 sm:mt-36 max-w-4xl mx-auto text-center">
              <p className="font-italic-serif text-2xl sm:text-4xl leading-[1.35] text-balance">
                “It's not just about how much I love you today. It's about how I want to keep loving you, tomorrow and the days after.”
              </p>
            </Reveal>
          </div>
        </section>

        {/* ================= 03 THE JOURNEY + BOARDING PASS ================= */}
        <section id="perjalanan" className="px-6 sm:px-10 py-28 sm:py-40 scroll-mt-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5">
              <Reveal>
                <Kicker n="03" label="Perjalanan Kita" />
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="mt-8 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.08] text-balance">
                  Satu tiket, <span className="font-italic-serif text-[#D9B98C]">satu tujuan.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="mt-6 text-base sm:text-lg leading-[1.85] text-[#F4ECE3]/75 font-light max-w-md">
                  Ke mana pun hari membawa kita, tempat duduk terbaik selalu yang ada di sebelah kamu.
                </p>
              </Reveal>
              <Reveal delay={0.25} className="mt-12 grid grid-cols-2 gap-8 max-w-sm">
                <div className="border-t hairline pt-4">
                  <p className="text-[10px] tracking-[0.28em] uppercase text-[#A99E99]">Bersama</p>
                  <p className="mt-2 font-serif text-2xl">{config.relationshipDuration}</p>
                </div>
                <div className="border-t hairline pt-4">
                  <p className="text-[10px] tracking-[0.28em] uppercase text-[#A99E99]">Hari ke</p>
                  <p className="mt-2 font-serif text-2xl">{days.toLocaleString('id-ID')}</p>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.15} className="lg:col-span-7">
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#26202E] to-[#1A1620] border border-[#F4ECE3]/12 shadow-[0_50px_100px_-50px_rgba(0,0,0,0.9)]">
                <div className="flex items-center justify-between px-7 sm:px-10 py-5 border-b border-dashed border-[#F4ECE3]/15">
                  <p className="font-serif text-sm tracking-[0.3em] uppercase">Our Little Universe</p>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-[#D9B98C]">Boarding pass</p>
                </div>
                <div className="px-7 sm:px-10 py-8 sm:py-10 grid grid-cols-2 gap-y-8 gap-x-6">
                  <PassField label="Dari" value="Hari pertama kita" big />
                  <PassField label="Ke" value="Selamanya" big />
                  <PassField label="Penumpang" value={config.partnerName} />
                  <PassField label="Berangkat" value={config.startDateLabel} />
                  <PassField label="Kursi" value="Di sebelahku" />
                  <PassField label="Kelas" value="Seumur hidup" />
                </div>
                <div className="relative border-t border-dashed border-[#F4ECE3]/15 px-7 sm:px-10 py-5 flex items-center justify-between gap-4">
                  <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[#14121A]" aria-hidden="true" />
                  <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-[#14121A]" aria-hidden="true" />
                  <p className="text-xs text-[#A99E99]">{config.anniversaryDate}</p>
                  <p className="font-italic-serif text-lg text-[#E0A08B]">♡</p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================= 04 HAPPY ANNIVERSARY ================= */}
        <section id="surat" className="relative scroll-mt-20">
          <div className="relative h-[70vh] min-h-[480px] overflow-hidden flex items-center justify-center text-center px-6">
            <img src={skyDusk} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover object-[50%_60%] opacity-70" />
            <img src={cloudWisps} alt="" aria-hidden="true" className="drift-b absolute top-[20%] left-[-10%] w-[120%] opacity-[0.15] mix-blend-screen pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#14121A] via-[#14121A]/20 to-[#14121A]" aria-hidden="true" />
            <div className="relative z-10 max-w-4xl">
              <Reveal>
                <Kicker n="04" label="And here we are" className="justify-center" />
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="mt-8 font-serif text-5xl sm:text-6xl lg:text-[5.4rem] leading-[1.03] text-balance">
                  Happy Anniversary, <span className="font-italic-serif text-[#E0A08B]">my love.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="mt-8 text-xs sm:text-sm tracking-[0.24em] uppercase text-[#F4ECE3]/75">
                  {config.relationshipDuration}
                  <span className="mx-3 text-[#D9B98C]" aria-hidden="true">·</span>
                  {config.anniversaryDate}
                </p>
              </Reveal>
            </div>
          </div>

          <div className="px-6 sm:px-10 pb-40">
            <div className="max-w-md mx-auto">
              <EditorialPhoto
                src={config.closingPhotoUrl}
                alt="Happy Anniversary, My Love"
                placeholderLabel={config.closingPhotoPlaceholder}
                aspectClass="aspect-[4/5]"
                caption={`Bersama kamu, ${config.partnerName}.`}
              />
            </div>

            <div className="mt-20 sm:mt-24 max-w-xl mx-auto space-y-7 text-base sm:text-[1.075rem] leading-[1.95] text-[#F4ECE3]/80 font-light">
              <Reveal>
                <p className="font-italic-serif text-2xl sm:text-3xl leading-snug text-[#F4ECE3]">
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
                <p className="py-8 my-4 border-y hairline font-italic-serif text-2xl sm:text-[1.7rem] leading-snug text-center text-[#D9B98C]">
                  Karena aku pernah bertemu kamu, dan aku mendapatkan kesempatan untuk mencintai kamu.
                </p>
              </Reveal>
              <Reveal>
                <p>Happy anniversary, sayang. I'm so glad it's you.</p>
              </Reveal>
              {config.extraSpecialNote && config.extraSpecialNote.trim() !== '' && (
                <Reveal>
                  <p className="pt-2 font-italic-serif text-xl text-[#E0A08B]">{config.extraSpecialNote}</p>
                </Reveal>
              )}
            </div>

            <Reveal className="mt-24 text-center">
              <p className="font-italic-serif text-2xl sm:text-3xl">Always a little more, every day.</p>
              <p className="mt-10 text-[11px] uppercase tracking-[0.3em] text-[#A99E99]">With all my love,</p>
              {config.yourName ? (
                <p className="mt-3 font-serif text-3xl">{config.yourName}</p>
              ) : (
                <p className="mt-3 text-[#E0A08B] text-xl" aria-hidden="true">♡</p>
              )}

              <div className="mt-16">
                <button
                  type="button"
                  onClick={() => setShowOneLastThing((v) => !v)}
                  aria-expanded={showOneLastThing}
                  className={`px-8 py-3.5 rounded-full border text-xs tracking-[0.24em] uppercase transition-colors duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9B98C]/50 ${
                    showOneLastThing
                      ? 'border-[#F4ECE3] bg-[#F4ECE3] text-[#14121A]'
                      : 'border-[#F4ECE3]/40 text-[#F4ECE3] hover:bg-[#F4ECE3] hover:text-[#14121A]'
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
                      className="max-w-lg mx-auto rounded-2xl bg-[#1C1824] border border-[#F4ECE3]/12 px-8 py-10 sm:px-12 sm:py-12 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]"
                    >
                      <p className="font-italic-serif text-xl sm:text-2xl leading-relaxed text-balance">
                        “Kalau kamu sudah sampai di sini, sini peluk dulu. I love you. More than this little website could ever explain.”
                      </p>
                      <p className="mt-6 text-[#E0A08B]" aria-hidden="true">♡</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t hairline px-6 sm:px-10 py-12 pb-24 sm:pb-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="font-serif text-sm tracking-[0.32em] uppercase">Our Little Universe</p>
          <nav className="flex flex-wrap justify-center gap-6" aria-label="Footer">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToId(item.id)}
                className="text-[13px] text-[#F4ECE3]/60 hover:text-[#F4ECE3] cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-[11px] tracking-[0.24em] uppercase text-[#D9B98C] hover:text-[#F4ECE3] cursor-pointer"
          >
            Kembali ke langit ↑
          </button>
        </div>
        <p className="mt-8 text-center text-[11px] text-[#A99E99]">
          © 2026 {config.yourName} untuk {config.partnerName}. Dibuat dengan cinta.
        </p>
      </footer>

      <AmbientAudioPlayer musicUrl={config.musicUrl} musicTitle={config.musicTitle} />
    </div>
  );
}
