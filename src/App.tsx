import React, { useRef, useState, useEffect } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  AnimatePresence,
} from 'motion/react';
import { ArrowDown } from 'lucide-react';
import { DEFAULT_LETTER_CONFIG, PersonalLetterConfig } from './config';
import { EditorialPhoto } from './components/EditorialPhoto';
import { AmbientAudioPlayer } from './components/AmbientAudioPlayer';
import { PersonalizeDrawer } from './components/PersonalizeDrawer';
import { ScrollPopUp, StaggeredHeadlinePopUp } from './components/ScrollPopUp';
import { Starfield } from './components/Starfield';
import {
  Comet,
  CometDivider,
  FloatingLetter,
  FloatingPolaroid,
  PlanetHorizon,
  SectionHorizon,
} from './components/CosmicDecor';

const STORAGE_KEY = 'our_little_universe_config_v1';

export default function App() {
  const [config, setConfig] = useState<PersonalLetterConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_LETTER_CONFIG, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore storage errors
    }
    return DEFAULT_LETTER_CONFIG;
  });

  const [showOneLastThing, setShowOneLastThing] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  const handleSaveConfig = (newConfig: PersonalLetterConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    } catch {
      // Ignore storage errors
    }
  };

  const handleResetConfig = () => {
    setConfig(DEFAULT_LETTER_CONFIG);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  };

  // Global scroll progress bar
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    restDelta: 0.001,
  });

  // Section refs for smooth scrolling & targeted scroll parallax
  const heroRef = useRef<HTMLElement | null>(null);
  const storyRef = useRef<HTMLElement | null>(null);
  const knowRef = useRef<HTMLElement | null>(null);
  const closingRef = useRef<HTMLElement | null>(null);
  const lastThingRef = useRef<HTMLDivElement | null>(null);

  // Hero scroll animations
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroImageScale = useTransform(heroScroll, [0, 1], [1, 1.08]);
  const heroImageY = useTransform(heroScroll, [0, 1], ['0%', '14%']);
  const heroTextY = useTransform(heroScroll, [0, 1], ['0%', '22%']);
  const heroOpacity = useTransform(heroScroll, [0, 0.85], [1, 0]);

  // Section 2 (Our Story) gentle parallax for memory photos
  const { scrollYProgress: storyScroll } = useScroll({
    target: storyRef,
    offset: ['start end', 'end start'],
  });
  const memoryOneParallax = useTransform(storyScroll, [0, 1], [-22, 22]);
  const memoryTwoParallax = useTransform(storyScroll, [0, 1], [18, -18]);

  // Section 3 (What I Want You To Know) subtle quote movement
  const { scrollYProgress: knowScroll } = useScroll({
    target: knowRef,
    offset: ['start end', 'end start'],
  });
  const quoteY = useTransform(knowScroll, [0.35, 1], [16, -12]);

  // Section 4 (Closing) focal photo parallax
  const { scrollYProgress: closingScroll } = useScroll({
    target: closingRef,
    offset: ['start end', 'end start'],
  });
  const closingPhotoParallax = useTransform(closingScroll, [0, 1], [-18, 18]);

  const scrollToStory = () => {
    storyRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenLastThing = () => {
    setShowOneLastThing((prev) => !prev);
  };

  useEffect(() => {
    if (showOneLastThing && lastThingRef.current) {
      const timer = window.setTimeout(() => {
        lastThingRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [showOneLastThing]);

  const coreMessages = [
    {
      number: '01',
      title: 'You are appreciated.',
      body: '“Aku menghargai kamu, bahkan untuk hal-hal kecil yang mungkin nggak pernah kamu sadari. Cara kamu hadir, cara kamu bercerita, dan hal-hal sederhana yang membuat kamu menjadi diri kamu sendiri.”',
    },
    {
      number: '02',
      title: "You don't have to be perfect.",
      body: '“Aku nggak berharap kamu selalu kuat, selalu baik-baik saja, atau selalu tahu harus melakukan apa. Aku ingin kamu tahu bahwa kamu juga boleh lelah, boleh punya hari yang buruk, dan boleh menjadi diri kamu sendiri.”',
    },
    {
      number: '03',
      title: 'I choose us.',
      body: '“Aku tahu hubungan bukan cuma tentang perasaan bahagia setiap hari. Akan ada hal yang perlu kita pelajari, perbedaan yang perlu kita pahami, dan keadaan yang perlu kita hadapi bersama. Tapi aku ingin terus belajar menjadi pasangan yang lebih baik buat kamu, bukan hanya lewat kata-kata, tetapi juga lewat caraku memperlakukan kamu.”',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#1A1030] text-[#F7EEE3] selection:bg-[#FF8A6B] selection:text-[#1A1030] overflow-x-hidden">
      {/* Subtle Film Grain Overlay across the entire viewport */}
      <div
        className="film-grain pointer-events-none fixed inset-0 z-30"
        aria-hidden="true"
      />

      {/* Minimalist Top Scroll Progress Indicator — a coral-to-peach sunset line */}
      <div
        className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-[#B9A3E3]/10 pointer-events-none"
        aria-hidden="true"
      >
        <motion.div
          className="h-full bg-gradient-to-r from-[#FF8A6B] to-[#FFC9A3] origin-left shadow-[0_0_10px_rgba(255,138,107,0.7)]"
          style={{ scaleX: smoothProgress }}
        />
      </div>

      {/* Main Single-Page Scrolling Experience — Strictly 4 Main Sections */}
      <main>
        {/* =====================================================================
            SECTION 1 — THE OPENING
           ===================================================================== */}
        <section
          ref={heroRef}
          id="the-opening"
          className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#1A1030] px-6 sm:px-12 lg:px-20 py-10 sm:py-14"
        >
          {/* Night sky: plum-indigo gradient with the hero photo blended in like a faded memory */}
          <motion.div
            style={{ scale: heroImageScale, y: heroImageY }}
            className="pointer-events-none absolute inset-0 z-0"
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#120A24_0%,#1A1030_45%,#2B1B4A_100%)]" />
            <img
              src={config.heroPhotoUrl}
              alt="Quiet twilight moment together"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center opacity-[0.14] mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1A1030]/85 via-[#1A1030]/45 to-transparent" />
            <div className="nebula-haze absolute inset-0" />
          </motion.div>

          {/* Twinkling lilac & peach starfield */}
          <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
            <Starfield density={1.2} />
          </div>

          {/* Coral comets crossing the sky */}
          <Comet className="top-[12%] -right-[8%] z-0" angle={-20} duration={10} delay={1.5} />
          <Comet className="top-[34%] -right-[12%] z-0 hidden sm:block" angle={-12} duration={14} delay={7} />

          {/* Sunset horizon glowing behind the curved edge of a planet */}
          <PlanetHorizon className="z-0" />

          {/* Floating polaroids & folded letters drifting at different depths */}
          <div className="pointer-events-none absolute inset-0 z-[5]" aria-hidden="true">
            <FloatingPolaroid
              src={config.heroPhotoUrl}
              alt=""
              className="hidden md:block w-32 lg:w-36 xl:w-44 top-[18%] left-[3%] xl:left-[4%]"
              tilt={-8}
              depth={0.9}
              duration={9}
              delay={0.4}
            />
            <FloatingPolaroid
              src={config.memoryPhoto1Url}
              alt=""
              className="hidden lg:block w-28 xl:w-32 bottom-[30%] right-[4%] xl:right-[6%]"
              tilt={7}
              depth={0.55}
              duration={11}
              delay={1}
            />
            <FloatingLetter
              className="hidden md:block w-28 lg:w-32 top-[12%] right-[4%] xl:right-[6%]"
              tilt={11}
              depth={0.5}
              duration={12}
              delay={0.8}
            />
            <FloatingLetter
              className="hidden lg:block w-24 bottom-[30%] left-[6%] xl:left-[9%]"
              tilt={-14}
              depth={0.3}
              duration={10}
              delay={1.6}
            />
            {/* A single tiny letter keeps the sky company on small screens */}
            <FloatingLetter
              className="md:hidden w-14 top-[7%] right-[7%]"
              tilt={12}
              depth={0.35}
              duration={10}
              delay={0.8}
            />
          </div>

          {/* Center Emotional Anchor */}
          <motion.div
            style={{ y: heroTextY, opacity: heroOpacity }}
            className="relative z-10 my-auto py-14 sm:py-16 lg:py-12 max-w-5xl mx-auto text-center flex flex-col items-center"
          >
            <ScrollPopUp delay={0.05} yOffset={24} initialScale={0.9}>
              <p className="text-xs sm:text-sm tracking-[0.32em] uppercase text-[#B9A3E3] mb-7 sm:mb-8">
                For <span className="text-[#F7EEE3] font-medium">{config.partnerName}</span>
              </p>
            </ScrollPopUp>

            <StaggeredHeadlinePopUp
              as="h1"
              text="“Of all the people in this world, I'm glad it's you.”"
              delay={0.12}
              className="max-w-[15ch] md:max-w-4xl font-serif text-[2.75rem] sm:text-7xl md:text-[5.25rem] lg:text-[6.5rem] leading-[1.04] tracking-[-0.015em] text-[#F7EEE3] text-balance font-normal [text-shadow:0_0_48px_rgba(255,138,107,0.22)]"
            />

            {/* Elegant Partner Name Display */}
            <ScrollPopUp
              delay={0.35}
              yOffset={28}
              initialScale={0.9}
              className="mt-9 sm:mt-11 flex items-center gap-4"
            >
              <span className="h-[1px] w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#FF8A6B]" aria-hidden="true" />
              <span className="font-serif italic text-2xl sm:text-3xl text-[#FFC9A3] tracking-wide">
                {config.partnerName}
              </span>
              <span className="h-[1px] w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#FF8A6B]" aria-hidden="true" />
            </ScrollPopUp>

            <ScrollPopUp delay={0.48} yOffset={28} initialScale={0.94}>
              <p className="mt-6 max-w-md sm:max-w-lg text-sm sm:text-base text-[#F7EEE3]/80 leading-relaxed font-light tracking-wide">
                A little place for everything I sometimes find difficult to say.
              </p>
            </ScrollPopUp>

            <ScrollPopUp
              delay={0.6}
              yOffset={32}
              initialScale={0.9}
              className="mt-10 sm:mt-12"
            >
              <button
                type="button"
                onClick={scrollToStory}
                className="group inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#FF8A6B] hover:bg-[#FFA084] text-[#1A1030] text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase shadow-[0_0_0_1px_rgba(255,201,163,0.5),0_0_34px_-4px_rgba(255,138,107,0.75)] hover:shadow-[0_0_0_1px_rgba(255,201,163,0.8),0_0_48px_-2px_rgba(255,138,107,0.9)] transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC9A3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1030]"
              >
                <span>Buka Surat</span>
                <ArrowDown className="w-3.5 h-3.5 stroke-[2] transition-transform duration-200 group-hover:translate-y-0.5" />
              </button>
            </ScrollPopUp>
          </motion.div>

          {/* Subtle Moving Scroll Indicator at Bottom (rests on the planet's dark curve) */}
          <ScrollPopUp
            delay={0.75}
            yOffset={20}
            className="relative z-10 flex flex-col items-center gap-3 pt-4"
          >
            <span className="text-[10px] tracking-[0.28em] uppercase text-[#FFC9A3]/80">
              Scroll Slowly
            </span>
            <div className="w-[1px] h-12 bg-[#FFC9A3]/20 overflow-hidden relative">
              <motion.div
                animate={{ y: ['-100%', '100%'] }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-full h-1/2 bg-gradient-to-b from-transparent to-[#FF8A6B]"
              />
            </div>
          </ScrollPopUp>
        </section>

        {/* =====================================================================
            SECTION 2 — OUR STORY
           ===================================================================== */}
        <section
          ref={storyRef}
          id="our-story"
          className="relative w-full overflow-hidden bg-[#1A1030] text-[#F7EEE3] py-28 sm:py-36 lg:py-44 px-6 sm:px-12 lg:px-20"
        >
          {/* Faint star dust & lilac nebula */}
          <div className="star-dust pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
          <div className="nebula-haze pointer-events-none absolute inset-0" aria-hidden="true" />
          <SectionHorizon />

          <div className="relative z-10 max-w-6xl mx-auto">
            {/* Editorial Section Header */}
            <ScrollPopUp yOffset={24} initialScale={0.94}>
              <div className="flex items-center gap-3 text-xs tracking-[0.24em] uppercase text-[#B9A3E3] mb-8">
                <span className="tabular-nums text-[#FF8A6B] font-medium">01</span>
                <span aria-hidden="true">·</span>
                <span>Our Story</span>
              </div>
            </ScrollPopUp>

            {/* Large Expressive Headline with Word-by-Word Pop Up */}
            <StaggeredHeadlinePopUp
              as="h2"
              text="“Somehow, you became my favorite part of every day.”"
              className="font-serif text-[2.4rem] sm:text-5xl md:text-6xl lg:text-[4.5rem] leading-[1.08] text-[#F7EEE3] max-w-4xl text-balance font-normal"
            />

            {/* Asymmetric Editorial Storytelling Grid */}
            <div className="mt-20 sm:mt-28 grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16 items-start">
              {/* Left Column: Narrative Blocks with Smooth Scroll Pop-Up */}
              <div className="lg:col-span-7 space-y-14 sm:space-y-20">
                {/* Paragraph Block 1 */}
                <ScrollPopUp
                  yOffset={48}
                  initialScale={0.91}
                  className="glass-orbit max-w-xl p-6 sm:p-8 rounded-2xl shadow-[0_24px_60px_-30px_rgba(10,4,24,0.9)] transition-[border-color,box-shadow] duration-300 hover:border-[#FF8A6B]/45 hover:shadow-[0_0_36px_-10px_rgba(255,138,107,0.45)]"
                >
                  <span className="block text-base font-serif italic text-[#FF8A6B] mb-3">
                    I. Awal yang sederhana
                  </span>
                  <p className="text-base sm:text-lg lg:text-[1.15rem] leading-[1.85] text-[#F7EEE3]/90 font-light tracking-[0.01em]">
                    Aku mungkin nggak selalu punya kata-kata yang tepat untuk menjelaskan semuanya. Tapi kalau ada satu hal yang selalu aku syukuri, itu adalah kesempatan untuk mengenal kamu, dekat sama kamu, dan menjalani hari-hari dengan kamu di dalamnya.
                  </p>
                </ScrollPopUp>

                {/* Tiny comet trail divider */}
                <ScrollPopUp yOffset={16} initialScale={0.95}>
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FF8A6B] shadow-[0_0_8px_2px_rgba(255,138,107,0.6)]" />
                    <span className="h-[1px] w-16 bg-gradient-to-r from-[#FF8A6B]/70 to-transparent" />
                  </div>
                </ScrollPopUp>

                {/* Paragraph Block 2 */}
                <ScrollPopUp
                  delay={0.06}
                  yOffset={48}
                  initialScale={0.91}
                  className="glass-orbit max-w-xl lg:ml-8 p-6 sm:p-8 rounded-2xl shadow-[0_24px_60px_-30px_rgba(10,4,24,0.9)] transition-[border-color,box-shadow] duration-300 hover:border-[#FF8A6B]/45 hover:shadow-[0_0_36px_-10px_rgba(255,138,107,0.45)]"
                >
                  <span className="block text-base font-serif italic text-[#FF8A6B] mb-3">
                    II. Ruang milik kita berdua
                  </span>
                  <p className="text-base sm:text-lg lg:text-[1.15rem] leading-[1.85] text-[#F7EEE3]/90 font-light tracking-[0.01em]">
                    Dari obrolan sederhana, tawa yang mungkin nggak penting buat orang lain, sampai momen-momen yang cuma kita berdua yang mengerti, semuanya pelan-pelan menjadi bagian dari hidup yang nggak ingin aku lewatkan begitu saja.
                  </p>
                </ScrollPopUp>

                {/* Tiny comet trail divider */}
                <ScrollPopUp yOffset={16} initialScale={0.95} className="lg:ml-8">
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FF8A6B] shadow-[0_0_8px_2px_rgba(255,138,107,0.6)]" />
                    <span className="h-[1px] w-16 bg-gradient-to-r from-[#FF8A6B]/70 to-transparent" />
                  </div>
                </ScrollPopUp>

                {/* Paragraph Block 3 */}
                <ScrollPopUp
                  delay={0.1}
                  yOffset={48}
                  initialScale={0.91}
                  className="glass-orbit max-w-xl p-6 sm:p-8 rounded-2xl shadow-[0_24px_60px_-30px_rgba(10,4,24,0.9)] transition-[border-color,box-shadow] duration-300 hover:border-[#FF8A6B]/45 hover:shadow-[0_0_36px_-10px_rgba(255,138,107,0.45)]"
                >
                  <span className="block text-base font-serif italic text-[#FF8A6B] mb-3">
                    III. Tempat pulang
                  </span>
                  <p className="text-base sm:text-lg lg:text-[1.15rem] leading-[1.85] text-[#F7EEE3]/90 font-light tracking-[0.01em]">
                    Ternyata, bahagia nggak selalu harus tentang sesuatu yang besar. Kadang, cukup tahu kalau di antara banyak hal yang terjadi hari ini, aku masih punya kamu untuk diceritakan semuanya.
                  </p>
                </ScrollPopUp>
              </div>

              {/* Right Column: Floating memory polaroids [FOTO KENANGAN 1] & Secondary Frame */}
              <div className="relative lg:col-span-5 space-y-12 lg:mt-6">
                <FloatingLetter
                  className="hidden lg:block w-24 -top-16 -left-10"
                  tilt={-10}
                  depth={0.35}
                  duration={12}
                />
                <EditorialPhoto
                  src={config.memoryPhoto1Url}
                  alt="Momen kenangan berdua"
                  placeholderLabel={config.memoryPhoto1Placeholder}
                  aspectClass="aspect-[3/4]"
                  parallaxY={memoryOneParallax}
                  caption="Sepotong waktu yang selalu ingin aku simpan."
                  indexLabel="FIG. 01"
                  theme="dark"
                  tilt={-2.5}
                  driftDuration={10}
                />

                <div className="w-4/5 ml-auto pt-4">
                  <EditorialPhoto
                    src={config.memoryPhoto2Url}
                    alt="Langkah perjalanan bersama"
                    placeholderLabel={config.memoryPhoto2Placeholder}
                    aspectClass="aspect-[4/3]"
                    parallaxY={memoryTwoParallax}
                    caption="Berjalan pelan, tumbuh bersama."
                    indexLabel="FIG. 02"
                    theme="dark"
                    delay={0.12}
                    tilt={3}
                    driftDuration={12}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <CometDivider />

        {/* =====================================================================
            SECTION 3 — WHAT I WANT YOU TO KNOW (Deep Orbit Peak Section)
           ===================================================================== */}
        <section
          ref={knowRef}
          id="what-i-want-you-to-know"
          className="relative w-full overflow-hidden bg-[linear-gradient(180deg,#1A1030_0%,#2B1B4A_38%,#2B1B4A_70%,#1A1030_100%)] text-[#F7EEE3] py-28 sm:py-36 lg:py-48 px-6 sm:px-12 lg:px-20"
        >
          <div className="star-dust pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
          <div
            className="pointer-events-none absolute -top-24 right-[-10rem] w-[36rem] h-[36rem] rounded-full bg-[#B9A3E3]/[0.08] blur-[120px]"
            aria-hidden="true"
          />
          <SectionHorizon />

          <div className="relative z-10 max-w-5xl mx-auto">
            {/* Section Kicker */}
            <ScrollPopUp yOffset={24} initialScale={0.94}>
              <div className="flex items-center gap-3 text-xs tracking-[0.24em] uppercase text-[#B9A3E3] mb-6">
                <span className="tabular-nums text-[#FF8A6B] font-semibold">02</span>
                <span aria-hidden="true">·</span>
                <span>What I Want You To Know</span>
              </div>
            </ScrollPopUp>

            {/* Section Headline */}
            <StaggeredHeadlinePopUp
              as="h2"
              text="“If there's one thing I hope you never forget…”"
              className="font-serif text-[2.4rem] sm:text-5xl md:text-6xl leading-[1.1] text-[#F7EEE3] max-w-3xl text-balance font-normal"
            />

            {/* Three Editorial Messages — Smooth Pop-Up Rows */}
            <div className="mt-16 sm:mt-24 border-t border-[#B9A3E3]/20">
              {coreMessages.map((item, index) => (
                <ScrollPopUp
                  key={item.number}
                  delay={index * 0.08}
                  yOffset={46}
                  initialScale={0.92}
                  className="py-12 sm:py-16 border-b border-[#B9A3E3]/20 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-baseline"
                >
                  {/* Number & Editorial Heading */}
                  <div className="md:col-span-5 flex items-baseline gap-4">
                    <span className="font-serif italic text-xl sm:text-2xl text-[#FF8A6B] tabular-nums shrink-0">
                      {item.number} —
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl text-[#F7EEE3] font-medium leading-snug text-balance">
                      {item.title}
                    </h3>
                  </div>

                  {/* Indonesian Emotional Prose */}
                  <div className="md:col-span-7">
                    <p className="text-base sm:text-lg leading-[1.85] text-[#F7EEE3]/80 font-light max-w-2xl">
                      {item.body}
                    </p>
                  </div>
                </ScrollPopUp>
              ))}
            </div>

            {/* Centerpiece Pull Quote with Spring Pop-Up + Parallax */}
            <motion.div style={{ y: quoteY }} className="mt-24 sm:mt-36">
              <ScrollPopUp
                yOffset={54}
                initialScale={0.89}
                className="glass-orbit relative overflow-hidden py-16 sm:py-24 px-6 sm:px-12 text-center rounded-[2rem] shadow-[0_0_0_1px_rgba(255,138,107,0.18),0_30px_80px_-30px_rgba(255,138,107,0.35)]"
              >
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(70%_100%_at_50%_100%,rgba(255,138,107,0.18),transparent_70%)]"
                  aria-hidden="true"
                />
                <p className="relative font-serif italic text-2xl sm:text-4xl md:text-[2.75rem] leading-[1.28] text-[#F7EEE3] max-w-3xl mx-auto text-balance">
                  “It's not just about how much I love you today. It's about how I want to keep loving you, tomorrow and the days after.”
                </p>
              </ScrollPopUp>
            </motion.div>
          </div>
        </section>

        <CometDivider />

        {/* =====================================================================
            SECTION 4 — HAPPY ANNIVERSARY, MY LOVE
           ===================================================================== */}
        <section
          ref={closingRef}
          id="happy-anniversary"
          className="relative w-full bg-[#1A1030] text-[#F7EEE3] pt-28 sm:pt-36 lg:pt-48 pb-56 sm:pb-72 px-6 sm:px-12 lg:px-20 overflow-hidden"
        >
          {/* Night sky with twinkling stars */}
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <Starfield density={0.55} />
          </div>
          {/* Warm sunset ambient glow */}
          <div
            className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[50rem] max-w-[140vw] h-[28rem] rounded-full bg-[#FF8A6B]/[0.10] blur-[130px]"
            aria-hidden="true"
          />
          <Comet className="top-[6%] -right-[10%]" angle={-18} duration={13} delay={3} />
          {/* The page closes on the same sunset planet it opened with */}
          <PlanetHorizon />

          <div className="relative z-10 max-w-4xl mx-auto">
            {/* Opening Kicker & Headline */}
            <div className="text-center">
              <ScrollPopUp yOffset={24} initialScale={0.92}>
                <p className="text-xs tracking-[0.28em] uppercase text-[#B9A3E3]">
                  AND HERE WE ARE…
                </p>
              </ScrollPopUp>

              <div className="mt-5">
                <StaggeredHeadlinePopUp
                  as="h2"
                  text="Happy Anniversary, My Love."
                  className="font-serif text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[1.06] text-[#F7EEE3] text-balance font-normal [text-shadow:0_0_48px_rgba(255,138,107,0.25)]"
                />
              </div>

              {/* Unboxed Editorial Metadata for Duration & Anniversary Date */}
              <ScrollPopUp
                delay={0.18}
                yOffset={28}
                initialScale={0.92}
                className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm tracking-[0.2em] uppercase text-[#FFC9A3]"
              >
                <span className="tabular-nums">{config.relationshipDuration}</span>
                <span aria-hidden="true" className="text-[#FF8A6B]">·</span>
                <span className="tabular-nums">{config.anniversaryDate}</span>
              </ScrollPopUp>
            </div>

            {/* Single Focal Point Photograph with Smooth Scroll Pop-Up */}
            <div className="mt-14 sm:mt-20 max-w-lg mx-auto">
              <EditorialPhoto
                src={config.closingPhotoUrl}
                alt="Happy Anniversary, My Love"
                placeholderLabel={config.closingPhotoPlaceholder}
                aspectClass="aspect-[3/4]"
                parallaxY={closingPhotoParallax}
                caption={`Bersama kamu, ${config.partnerName}.`}
                indexLabel="FIG. 03"
                theme="dark"
                tilt={-1.5}
                driftDuration={11}
              />
            </div>

            {/* Closing Love Letter Prose — Each paragraph smoothly pops up on scroll */}
            <div className="mt-16 sm:mt-24 max-w-2xl mx-auto space-y-8 text-base sm:text-lg leading-[1.9] text-[#F7EEE3]/90 font-light tracking-[0.01em]">
              <ScrollPopUp yOffset={36} initialScale={0.93}>
                <p className="font-serif italic text-2xl sm:text-3xl text-[#FFC9A3] leading-snug">
                  “Terima kasih sudah menjadi bagian dari perjalanan hidupku.
                </p>
              </ScrollPopUp>

              <ScrollPopUp delay={0.05} yOffset={36} initialScale={0.93}>
                <p>
                  Terima kasih untuk semua cerita, semua tawa, semua waktu yang kita punya, dan bahkan hal-hal kecil yang mungkin terlihat biasa, tetapi selalu punya tempat tersendiri buat aku.
                </p>
              </ScrollPopUp>

              <ScrollPopUp delay={0.08} yOffset={36} initialScale={0.93}>
                <p>
                  Aku nggak tahu semua hal yang akan kita temui ke depannya. Tapi aku berharap kita masih punya banyak kesempatan untuk tumbuh, belajar, saling memahami, dan menciptakan cerita-cerita baru yang suatu hari nanti bisa kita kenang sambil tersenyum.
                </p>
              </ScrollPopUp>

              <ScrollPopUp delay={0.1} yOffset={36} initialScale={0.93}>
                <p>
                  Kalau suatu saat nanti kamu bertanya apa yang membuatku bersyukur tentang perjalanan ini, aku harap jawabannya tetap sederhana:
                </p>
              </ScrollPopUp>

              <ScrollPopUp
                delay={0.12}
                yOffset={42}
                initialScale={0.9}
                className="glass-orbit text-[#F7EEE3] font-normal font-serif italic text-xl sm:text-2xl py-7 px-6 sm:px-8 rounded-2xl text-center shadow-[0_0_0_1px_rgba(255,138,107,0.22),0_0_40px_-12px_rgba(255,138,107,0.5)]"
              >
                <p>
                  Karena aku pernah bertemu kamu, dan aku mendapatkan kesempatan untuk mencintai kamu.
                </p>
              </ScrollPopUp>

              <ScrollPopUp delay={0.14} yOffset={36} initialScale={0.93}>
                <p>Happy anniversary, sayang. I'm so glad it's you.”</p>
              </ScrollPopUp>

              {config.extraSpecialNote && config.extraSpecialNote.trim() !== '' && (
                <ScrollPopUp delay={0.16} yOffset={36} initialScale={0.93}>
                  <p className="pt-4 text-[#FFC9A3] italic font-serif text-xl">
                    “{config.extraSpecialNote}”
                  </p>
                </ScrollPopUp>
              )}
            </div>

            {/* Closing Sign-off & Digital Signature */}
            <ScrollPopUp
              yOffset={44}
              initialScale={0.91}
              className="mt-20 sm:mt-28 pt-12 border-t border-[#B9A3E3]/20 text-center"
            >
              <p className="font-serif italic text-2xl sm:text-4xl text-[#FFC9A3] tracking-wide">
                “Always a little more, every day.”
              </p>

              <div className="mt-10 space-y-2">
                <p className="text-xs uppercase tracking-[0.24em] text-[#B9A3E3]">
                  With all my love,
                </p>
                <p className="font-serif text-2xl sm:text-3xl text-[#F7EEE3] tracking-wide">
                  {config.yourName} <span className="text-[#FF8A6B]">♡</span>
                </p>
              </div>

              {/* Final Interactive Button: "One last thing…" */}
              <div className="mt-14">
                <button
                  type="button"
                  onClick={handleOpenLastThing}
                  aria-expanded={showOneLastThing}
                  className={`px-8 py-3.5 rounded-full border text-[#F7EEE3] text-xs sm:text-sm tracking-[0.22em] uppercase transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC9A3] ${
                    showOneLastThing
                      ? 'border-[#FF8A6B] bg-[#FF8A6B]/20 shadow-[0_0_30px_-6px_rgba(255,138,107,0.7)]'
                      : 'border-[#FF8A6B]/55 bg-[#2B1B4A]/60 hover:border-[#FF8A6B] hover:bg-[#FF8A6B]/15 hover:shadow-[0_0_30px_-6px_rgba(255,138,107,0.6)]'
                  }`}
                >
                  One last thing…
                </button>
              </div>

              {/* Soft Inline Spring Pop-Up Reveal for "One last thing…" — an unfolded letter */}
              <div ref={lastThingRef} className="mt-10 min-h-[4rem]">
                <AnimatePresence>
                  {showOneLastThing && (
                    <motion.div
                      initial={{ opacity: 0, y: 28, scale: 0.9, rotate: -1.5 }}
                      animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, y: 16, scale: 0.94 }}
                      transition={{
                        type: 'spring',
                        stiffness: 110,
                        damping: 18,
                        mass: 0.8,
                      }}
                      className="folded-letter coral-glow relative max-w-xl mx-auto p-8 sm:p-10 rounded-md text-center"
                    >
                      <span
                        className="absolute top-4 right-4 h-3 w-3 rounded-full bg-[#FF8A6B] shadow-[0_0_10px_2px_rgba(255,138,107,0.6)]"
                        aria-hidden="true"
                      />
                      <p className="relative font-serif italic text-xl sm:text-2xl md:text-[1.7rem] leading-relaxed text-[#2B1B4A] text-balance">
                        “Kalau kamu sudah sampai di sini, sini peluk dulu. I love you. More than this little website could ever explain.”
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollPopUp>
          </div>
        </section>
      </main>

      {/* Optional Ambient Music Control & Placeholder Customizer Trigger in Corner */}
      <AmbientAudioPlayer
        musicUrl={config.musicUrl}
        musicTitle={config.musicTitle}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
      />

      {/* Slide-over Drawer for Editing Personal Placeholders */}
      <PersonalizeDrawer
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        config={config}
        onSave={handleSaveConfig}
        onReset={handleResetConfig}
      />
    </div>
  );
}
