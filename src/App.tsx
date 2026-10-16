import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform, AnimatePresence, useReducedMotion } from 'motion/react';
import { DEFAULT_LETTER_CONFIG } from './config';
import { EditorialPhoto } from './components/EditorialPhoto';
import { AmbientAudioPlayer } from './components/AmbientAudioPlayer';
import { Reveal } from './components/Reveal';
import { BoardingPass } from './components/BoardingPass';
import { PhotoMarquee } from './components/PhotoMarquee';
import { LetterEnvelope } from './components/LetterEnvelope';
import { HeartFlight } from './components/HeartFlight';
import { OpeningGate } from './components/OpeningGate';
import gallery1 from './assets/images/gallery/gallery-1.jpg';
import gallery2 from './assets/images/gallery/gallery-2.jpg';
import gallery3 from './assets/images/gallery/gallery-3.jpg';
import gallery4 from './assets/images/gallery/gallery-4.jpg';
import gallery5 from './assets/images/gallery/gallery-5.jpg';
import gallery6 from './assets/images/gallery/gallery-6.jpg';
import gallery7 from './assets/images/gallery/gallery-7.jpg';
import gallery8 from './assets/images/gallery/gallery-8.jpg';
import gallery9 from './assets/images/gallery/gallery-9.jpg';
import gallery10 from './assets/images/gallery/gallery-10.jpg';
import gallery11 from './assets/images/gallery/gallery-11.jpg';
import gallery12 from './assets/images/gallery/gallery-12.jpg';
import gallery13 from './assets/images/gallery/gallery-13.jpg';
import gallery14 from './assets/images/gallery/gallery-14.jpg';
import gallery15 from './assets/images/gallery/gallery-15.jpg';
import gallery16 from './assets/images/gallery/gallery-16.jpg';
import gallery17 from './assets/images/gallery/gallery-17.jpg';
import gallery18 from './assets/images/gallery/gallery-18.jpg';
import gallery19 from './assets/images/gallery/gallery-19.jpg';
import gallery20 from './assets/images/gallery/gallery-20.jpg';
import skyDay from './assets/sky/sky-day.jpg';
import cloudWisps from './assets/sky/cloud-wisps.jpg';
import skyNyc from './assets/sky/sky-nyc.jpg';
import footerCouple from './assets/sky/footer-couple.jpg';

const NAV = [
  { id: 'cerita', label: 'Cerita', n: '01' },
  { id: 'pesan', label: 'Pesan', n: '02' },
  { id: 'perjalanan', label: 'Perjalanan', n: '03' },
  { id: 'surat', label: 'Surat', n: '04' },
];

const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

const Kicker: React.FC<{ n: string; label: string; className?: string }> = ({ n, label, className = '' }) => (
  <div className={`flex items-center gap-3 text-[11px] tracking-[0.3em] uppercase text-[#6E6A64] ${className}`}>
    <span className="text-[#5B8FC7]">{n}</span>
    <span className="h-px w-8 bg-[#1C1B19]/15" aria-hidden="true" />
    <span>{label}</span>
  </div>
);

function daysTogether(iso: string) {
  const start = new Date(`${iso}T00:00:00+07:00`).getTime();
  return Math.max(0, Math.floor((Date.now() - start) / 86400000));
}

export default function App() {
  const config = DEFAULT_LETTER_CONFIG;
  const reduce = useReducedMotion();
  const firstName = config.partnerName.split(' ')[0];

  const [opened, setOpened] = useState(false);
  const openGate = () => {
    window.dispatchEvent(new Event('universe:play'));
    window.scrollTo(0, 0);
    setOpened(true);
  };
  const [showOneLastThing, setShowOneLastThing] = useState(false);
  const [activeMsg, setActiveMsg] = useState(0);
  const [days] = useState(() => daysTogether(config.startDateISO));

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 28, restDelta: 0.001 });

  // Hero parallax: the sky sinks slowly, the cloud bank rises, the text lifts away.
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const skyY = useTransform(heroP, [0, 1], ['0%', reduce ? '0%' : '18%']);
  const textY = useTransform(heroP, [0, 1], ['0%', reduce ? '0%' : '-35%']);
  const textO = useTransform(heroP, [0, 0.7], [1, 0]);

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
    <div className="relative min-h-screen bg-[#FAF8F2] text-[#1C1B19] overflow-x-hidden">
      {/* Hairline reading progress */}
      <div className="fixed top-0 inset-x-0 z-[60] h-px pointer-events-none" aria-hidden="true">
        <motion.div className="h-full bg-[#5B8FC7] origin-left" style={{ scaleX: progress }} />
      </div>

      {/* ================= NAV ================= */}

      <main>
        {/* ================= HERO: ABOVE THE CLOUDS ================= */}
        <section ref={heroRef} id="hero" className="relative h-[100svh] min-h-[620px] w-full overflow-hidden">
          <motion.img
            src={skyDay}
            alt=""
            aria-hidden="true"
            style={{ y: skyY }}
            className="absolute inset-0 w-full h-[115%] object-cover object-[50%_30%]"
          />
          {/* drifting wisps, screen-blended so only the light shows */}
          <div className="absolute inset-0 pointer-events-none mix-blend-screen" aria-hidden="true">
            <img src={cloudWisps} alt="" className="drift-a absolute top-[6%] left-[-10%] w-[120%] opacity-[0.22]" />
            <img src={cloudWisps} alt="" className="drift-b absolute top-[28%] left-[-15%] w-[130%] opacity-[0.12] scale-x-[-1]" />
            <img src={cloudWisps} alt="" className="drift-c absolute top-[46%] left-[-5%] w-[110%] opacity-[0.10]" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#2F5F96]/55 via-[#4A80BC]/25 via-55% to-[#FAF8F2]" aria-hidden="true" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_48%,rgba(47,95,150,0.55),transparent_75%)]" aria-hidden="true" />

          <div className="absolute inset-x-0 top-[7%] h-[34%] pointer-events-none z-[5]">
            {opened && <HeartFlight />}
          </div>

          <motion.div
            key={opened ? 'hero-on' : 'hero-off'}
            style={{ y: textY, opacity: textO }}
            className="relative z-10 h-full max-w-5xl mx-auto px-6 flex flex-col items-center justify-center text-center"
          >
            <Reveal>
              <p className="text-[11px] tracking-[0.32em] uppercase text-white drop-shadow-[0_1px_8px_rgba(28,60,100,0.6)]">
                For <span className="text-white font-bold">{config.partnerName}</span>
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="mt-8 font-serif text-[2.6rem] sm:text-6xl lg:text-[5.4rem] leading-[1.04] tracking-[-0.01em] text-balance text-white drop-shadow-[0_2px_24px_rgba(28,60,100,0.55)]">
                {"Of all the people in this world, I'm glad it's".split(' ').map((w, i) => (
                  <motion.span
                    key={i}
                    className="inline-block mr-[0.25em]"
                    initial={reduce ? false : { opacity: 0, y: 18, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {w}
                  </motion.span>
                ))}
                <motion.span
                  className="inline-block font-italic-serif bg-gradient-to-r from-white to-[#F6D5CB] bg-clip-text text-transparent"
                  initial={reduce ? false : { opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 1.1, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  you.
                </motion.span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-8 max-w-md mx-auto text-base sm:text-lg leading-relaxed text-white font-normal drop-shadow-[0_1px_12px_rgba(28,60,100,0.6)]">
                A little place for everything I sometimes find difficult to say.
              </p>
            </Reveal>
          </motion.div>

          <button
            type="button"
            onClick={() => scrollToId('tentang')}
            className="absolute z-10 bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-[10px] tracking-[0.32em] uppercase text-[#4A4640] hover:text-[#1C1B19] cursor-pointer"
          >
            Scroll untuk mulai
            <span className="h-10 w-px bg-gradient-to-b from-[#1C1B19]/40 to-transparent" aria-hidden="true" />
          </button>
        </section>

        {/* ================= INTRO STATEMENT ================= */}
        <section id="tentang" className="px-6 sm:px-10 py-28 sm:py-40">
          <Reveal className="max-w-4xl mx-auto">
            <p className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.2] text-balance">
              Di atas segalanya, dunia jadi tenang.{' '}
              <span className="text-[#6E6A64]">
                Website kecil ini dibuat untuk satu orang, dan setiap bagiannya cuma tentang{' '}
              </span>
              <span className="font-italic-serif text-grad">kamu.</span>
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
                  <span className="font-italic-serif text-grad">favorite part</span> of every day.
                </h2>
              </Reveal>
            </div>

            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10">
              {storyParts.map((part, i) => (
                <Reveal key={part.title} delay={i * 0.08} className="border-t hairline pt-6">
                  <p className="text-[10px] tracking-[0.3em] text-[#5B8FC7]">0{i + 1}</p>
                  <h3 className="mt-4 font-italic-serif text-2xl text-[#1C1B19]">{part.title}</h3>
                  <p className="mt-4 text-[0.98rem] leading-[1.9] text-[#1C1B19]/75 font-light">{part.body}</p>
                </Reveal>
              ))}
            </div>

          </div>
        </section>

        {/* ================= GALLERY: PHOTOS GLIDING BOTH WAYS ================= */}
        <section id="galeri" aria-label="Galeri foto" className="bg-gradient-to-b from-[#FAF8F2] via-[#F8EEEA] to-[#FAF8F2] py-24 sm:py-32 overflow-hidden">
          <div className="px-6 sm:px-10 max-w-7xl mx-auto text-center">
            <Reveal>
              <p className="text-[11px] tracking-[0.3em] uppercase text-[#6E6A64]">Potongan-potongan kecil</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.08] text-balance">
                Hal-hal kecil, <span className="font-italic-serif text-grad">cerita kita.</span>
              </h2>
            </Reveal>
          </div>
          <div className="mt-14 sm:mt-20">
            <PhotoMarquee
              rowA={[
                { src: gallery5, alt: 'Foto berdua dengan latar tirai merah' },
                { src: gallery1, alt: 'Selfie dengan boneka kelinci' },
                { src: gallery7, alt: 'Selfie berdua' },
                { src: gallery2, alt: 'Foto berdua di depan gedung' },
                { src: gallery9, alt: 'Salsabilla tersenyum di bawah tenda merah' },
                { src: gallery11, alt: 'Salsabilla minum dengan pipi menggembung' },
                { src: gallery14, alt: 'Selfie berdua di warung tenda' },
                { src: gallery16, alt: 'Salsabilla tersenyum di restoran' },
                { src: gallery13, alt: 'Makan malam berdua di rooftop' },
                { src: gallery19, alt: 'Salsabilla duduk di samping patung bertopi merah' },
              ]}
              rowB={[
                { src: gallery6, alt: 'Foto berdua duduk dengan latar tirai merah' },
                { src: gallery3, alt: 'Buket bunga di mobil' },
                { src: gallery8, alt: 'Strip photobooth' },
                { src: gallery4, alt: 'Foto masa kecil naik sepeda' },
                { src: gallery10, alt: 'Foto berdua di depan Fakultas Hukum Universitas Brawijaya' },
                { src: gallery12, alt: 'Foto bayi dengan topi merah' },
                { src: gallery15, alt: 'Salsabilla memeluk boneka beruang' },
                { src: gallery17, alt: 'Makan bersama teman-teman' },
                { src: gallery18, alt: 'Dimas berpose di samping patung bertopi merah' },
                { src: gallery20, alt: 'Salsabilla tersenyum bertopang dagu' },
              ]}
            />
          </div>
        </section>

        {/* ================= 02 WHAT I WANT YOU TO KNOW ================= */}
        <section id="pesan" className="bg-gradient-to-b from-[#FAF8F2] via-[#EEF3F8] to-[#FAF8F2] px-6 sm:px-10 py-28 sm:py-40 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <Kicker n="02" label="What I Want You To Know" />
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-8 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.08] max-w-3xl text-balance">
                If there's one thing I hope you{' '}
                <span className="font-italic-serif text-grad">never forget</span>…
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
                        active ? 'text-[#1C1B19]' : 'text-[#1C1B19]/55 hover:text-[#1C1B19]/80'
                      }`}
                    >
                      <span className={`font-italic-serif text-lg w-8 ${active ? 'text-[#5B8FC7]' : ''}`}>{item.number}</span>
                      <span className="font-serif text-2xl sm:text-3xl">{item.title}</span>
                    </button>
                  );
                })}
                <div className="border-t hairline" />
              </div>

              <div className="lg:col-span-7 rounded-3xl bg-white/80 border border-[#1C1B19]/6 shadow-[0_30px_60px_-40px_rgba(40,70,110,0.35)] p-8 sm:p-12 min-h-[16rem] flex items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeMsg}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="text-[10px] tracking-[0.3em] uppercase text-[#5B8FC7]">
                      Pesan {coreMessages[activeMsg].number}
                    </p>
                    <p className="mt-5 text-lg sm:text-xl leading-[1.85] text-[#1C1B19]/85 font-light">
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
        <section id="perjalanan" className="bg-gradient-to-b from-[#FAF8F2] via-[#EEF3F8] to-[#FAF8F2] px-6 sm:px-10 py-28 sm:py-40 scroll-mt-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5">
              <Reveal>
                <Kicker n="03" label="Perjalanan Kita" />
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="mt-8 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.08] text-balance">
                  Satu tiket, <span className="font-italic-serif text-grad">satu tujuan.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="mt-6 text-base sm:text-lg leading-[1.85] text-[#1C1B19]/75 font-light max-w-md">
                  Ke mana pun hari membawa kita, tempat duduk terbaik selalu yang ada di sebelah kamu.
                </p>
              </Reveal>
              <Reveal delay={0.25} className="mt-12 grid grid-cols-2 gap-8 max-w-sm">
                <div className="border-t hairline pt-4">
                  <p className="text-[10px] tracking-[0.28em] uppercase text-[#6E6A64]">Bersama</p>
                  <p className="mt-2 font-serif text-2xl">{config.relationshipDuration}</p>
                </div>
                <div className="border-t hairline pt-4">
                  <p className="text-[10px] tracking-[0.28em] uppercase text-[#6E6A64]">Hari ke</p>
                  <p className="mt-2 font-serif text-2xl">{days.toLocaleString('id-ID')}</p>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.15} className="lg:col-span-7 py-6">
              <BoardingPass passenger={config.partnerName} date={config.startDateLabel} />
            </Reveal>
          </div>
        </section>

        {/* ================= 04 HAPPY ANNIVERSARY ================= */}
        <section id="surat" className="relative scroll-mt-20">
          <div className="relative h-[70vh] min-h-[480px] overflow-hidden flex items-center justify-center text-center px-6">
            <img src={skyNyc} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover object-[50%_45%]" />
            <img src={cloudWisps} alt="" aria-hidden="true" className="drift-b absolute top-[20%] left-[-10%] w-[120%] opacity-[0.15] mix-blend-screen pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F2] via-[#2F5F96]/35 via-50% to-[#FAF8F2]" aria-hidden="true" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(40,80,130,0.45),transparent_75%)]" aria-hidden="true" />
            <div className="relative z-10 max-w-4xl">
              <Reveal>
                <Kicker n="04" label="And here we are" className="justify-center !text-white [&>span:first-child]:!text-white" />
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="mt-8 font-serif text-5xl sm:text-6xl lg:text-[5.4rem] leading-[1.03] text-balance text-white drop-shadow-[0_2px_30px_rgba(30,60,90,0.45)]">
                  Happy Anniversary, <span className="font-italic-serif bg-gradient-to-r from-white to-[#F6D5CB] bg-clip-text text-transparent">my love.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="mt-8 text-xs sm:text-sm tracking-[0.24em] uppercase text-white drop-shadow-[0_1px_10px_rgba(30,60,90,0.5)]">
                  {config.relationshipDuration}
                  <span className="mx-3" aria-hidden="true">·</span>
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

            <div className="mt-24 sm:mt-28">
              <Reveal>
                <LetterEnvelope to={firstName} initials="D&S">
                  <p className="text-right font-fell italic text-sm sm:text-base text-[#3B2A1E]/70">Malang, 19 Oktober 2026</p>
                  <p className="mt-10 font-letter text-4xl sm:text-5xl text-[#2A1D14]">My dearest {firstName},</p>
                  <div className="mt-8 space-y-6 font-letter text-[1.55rem] sm:text-[1.85rem] leading-[1.55] text-[#2A1D14]/90">
                    <p>Terima kasih sudah menjadi bagian dari perjalanan hidupku.</p>
                    <p>
                      Terima kasih untuk semua cerita, semua tawa, semua waktu yang kita punya, dan bahkan hal-hal kecil yang mungkin terlihat biasa, tetapi selalu punya tempat tersendiri buat aku.
                    </p>
                    <p>
                      Aku nggak tahu semua hal yang akan kita temui ke depannya. Tapi aku berharap kita masih punya banyak kesempatan untuk tumbuh, belajar, saling memahami, dan menciptakan cerita-cerita baru yang suatu hari nanti bisa kita kenang sambil tersenyum.
                    </p>
                    <p>
                      Kalau suatu saat nanti kamu bertanya apa yang membuatku bersyukur tentang perjalanan ini, aku harap jawabannya tetap sederhana:
                    </p>
                    <p className="py-4 text-center text-[1.9rem] sm:text-[2.3rem] leading-[1.4] text-[#8E1A22]">
                      Karena aku pernah bertemu kamu, dan aku mendapatkan kesempatan untuk mencintai kamu.
                    </p>
                    <p>Happy anniversary, sayang. I'm so glad it's you.</p>
                    {config.extraSpecialNote && config.extraSpecialNote.trim() !== '' && (
                      <p className="text-[#8E1A22]">{config.extraSpecialNote}</p>
                    )}
                    <p>Always a little more, every day.</p>
                  </div>
                  <div className="mt-14 text-right">
                    <p className="font-fell italic text-base sm:text-lg text-[#3B2A1E]/75">With all my love,</p>
                    <p className="mt-2 font-letter text-4xl sm:text-5xl text-[#2A1D14]">{config.yourName || '♡'}</p>
                  </div>
                </LetterEnvelope>
              </Reveal>
            </div>

            <Reveal className="mt-20 text-center">
              <div className="mt-16">
                <button
                  type="button"
                  onClick={() => setShowOneLastThing((v) => !v)}
                  aria-expanded={showOneLastThing}
                  className={`px-8 py-3.5 rounded-full border text-xs tracking-[0.24em] uppercase transition-colors duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FC7]/50 ${
                    showOneLastThing
                      ? 'border-[#1C1B19] bg-white text-[#1C1B19]'
                      : 'border-[#1C1B19] bg-[#1C1B19] text-white hover:bg-black'
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
                      className="max-w-lg mx-auto rounded-3xl bg-white border border-[#1C1B19]/6 px-8 py-10 sm:px-12 sm:py-12 shadow-[0_40px_80px_-40px_rgba(40,70,110,0.4)]"
                    >
                      <p className="font-italic-serif text-xl sm:text-2xl leading-relaxed text-balance">
                        “Kalau kamu sudah sampai di sini, sini peluk dulu. I love you. More than this little website could ever explain.”
                      </p>
                      <p className="mt-6 text-[#D98C7A]" aria-hidden="true">♡</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="relative bg-[#2A5D8C] text-[#FAF8F2] overflow-hidden">
        <div className="px-6 sm:px-10 pt-20 sm:pt-28 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12">
            <div className="max-w-xl">
              <p className="text-[11px] tracking-[0.32em] uppercase text-[#FAF8F2]/80">Untuk {config.partnerName}</p>
              <h2 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-balance">
                Our Little <span className="font-italic-serif text-[#F6D5CB]">Universe.</span>
              </h2>
              <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#FAF8F2]/90 font-light">
                Tempat kecil untuk kita berdua, hari ini dan seterusnya.
              </p>
            </div>
            <div className="flex flex-col items-start lg:items-end gap-6">
              <nav className="flex flex-wrap gap-x-7 gap-y-3" aria-label="Footer">
                {NAV.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToId(item.id)}
                    className="text-[13px] tracking-[0.08em] text-[#FAF8F2]/85 hover:text-white underline-offset-4 hover:underline cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-5 py-2.5 rounded-full bg-[#FAF8F2] text-[#1C1B19] text-[11px] tracking-[0.22em] uppercase hover:bg-white transition-colors cursor-pointer"
              >
                Kembali ke langit ↑
              </button>
            </div>
          </div>
          <p className="mt-14 pt-6 border-t border-[#FAF8F2]/20 text-[11px] text-[#FAF8F2]/75">
            © 2026 {config.yourName} untuk {config.partnerName}. Dibuat dengan cinta.
          </p>
        </div>
        <img
          src={footerCouple}
          alt="Ilustrasi sepasang kekasih duduk berdua di bukit menikmati pemandangan"
          loading="lazy"
          className="block w-full h-auto mt-4 select-none"
          draggable={false}
        />
      </footer>

      <OpeningGate open={opened} name={firstName} onOpen={openGate} />
      <AmbientAudioPlayer musicUrl={config.musicUrl} musicTitle={config.musicTitle} />
    </div>
  );
}
