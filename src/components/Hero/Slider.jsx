"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Container from "../Container/Container";
import { ArrowLeft, ArrowRight } from "lucide-react";

// ─── Animation Variants ───────────────────────────────────────────────────────
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.85, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: (direction) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    transition: { duration: 0.85, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1, ease: "easeOut" },
  },
};

const textContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const textItemVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ isActive, duration }) => (
  <div className="h-[2px] w-full bg-white/20 overflow-hidden rounded-full">
    {isActive && (
      <motion.div
        className="h-full rounded-full bg-primary"
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{
          duration: duration / 1000,
          ease: "linear",
          repeat: 0,
        }}
        key={`progress-${isActive}`}
      />
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HeroSlider({ heroSliderData, autoPlayInterval = 5000 }) {
  const [[current, direction], setPage] = useState([0, 0]);

  const paginate = useCallback(
    (newDirection) => {
      setPage(([prev]) => {
        const next = (prev + newDirection + heroSliderData.length) % heroSliderData.length;
        return [next, newDirection];
      });
    },
    [heroSliderData.length]
  );

  const goTo = (index) => {
    const dir = index > current ? 1 : -1;
    setPage([index, dir]);
  };

  // Auto-play
  useEffect(() => {
    if (heroSliderData.length <= 1) return;
    const timer = setInterval(() => paginate(1), autoPlayInterval);
    return () => clearInterval(timer);
  }, [paginate, autoPlayInterval, heroSliderData.length]);

  if (!heroSliderData || heroSliderData.length === 0) return null;

  const slide = heroSliderData[current];

  return (
    <section
      className="relative w-full overflow-hidden bg-black h-[250px] sm:h-[380px] md:h-[clamp(480px,90vh,820px)]"
      aria-label="Hero banner"
    >
      {/* ── Slide Images ─────────────────────────────── */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={slide.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 w-full h-full"
        >
          {slide.link ? (
            <Link
              href={slide.link}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 block w-full h-full cursor-pointer z-10"
            >
              {/* Background Image */}
              <Image
                src={slide.image}
                alt={slide.title || "Hero banner"}
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
                loading="eager"
              />
            </Link>
          ) : (
            <div className="absolute inset-0 block w-full h-full">
              {/* Background Image */}
              <Image
                src={slide.image}
                alt={slide.title || "Hero banner"}
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
                loading="eager"
              />
            </div>
          )}

          {/* Layered Overlay - Gradient removed/commented out to show pure image */}
          {/* <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent"
          /> */}
        </motion.div>
      </AnimatePresence>

      {/* ── Text Content — Removed/Commented out to show pure image ─────────────────────────────── */}
      {/* <div className="absolute inset-0 flex items-center">
        <Container>
          <div className="w-full mx-[10%]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${slide.id}`}
                variants={textContainerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
                className="max-w-xl lg:max-w-2xl"
              >
                <motion.div variants={textItemVariants}>
                  <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-[0.18em] uppercase mb-4 text-stone-300">
                    <span className="inline-block w-6 h-[1.5px] bg-stone-300" />
                    {slide.sub_title}
                  </span>
                </motion.div>

                <motion.h1
                  variants={textItemVariants}
                  className="text-white font-semibold leading-[1.12] mb-5 md:mb-7  text-2xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-6xl"
                >
                  {slide.title}
                </motion.h1>

                <motion.div variants={textItemVariants}>
                  <Link
                    href={slide.link}>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className="group relative inline-flex items-center gap-3 overflow-hidden px-7 py-3.5 sm:px-9 sm:py-4 text-sm sm:text-base font-semibold text-white tracking-wide transition-all duration-500 cursor-pointer bg-primary hover:bg-primary-hover"
                      style={{
                        boxShadow: `0 4px 24px var(--primary)73`
                      }}
                    >
                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      <span>Shop Now</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:-translate-x-1" />
                    </motion.button>
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Container>
      </div> */}

      {/* ── Prev / Next Arrows ──────────────────────── */}
      {heroSliderData.length > 1 && (
        <>
          {/* Prev */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => paginate(-1)}
            aria-label="Previous slide"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center rounded-full border border-white/25 bg-white w-10 h-10 sm:w-12 sm:h-12 md:w-13 md:h-13"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#5A0C3D"
              strokeWidth={2.2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>

          {/* Next */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => paginate(1)}
            aria-label="Next slide"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center rounded-full border border-white/25 bg-white w-10 h-10 sm:w-12 sm:h-12 md:w-13 md:h-13"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#5A0C3D"
              strokeWidth={2.2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </>
      )}

      {/* ── Bottom Controls: Progress bars + dots ─── */}
      {heroSliderData.length > 1 && (
        <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 z-20">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
            <div className="flex items-center gap-3 sm:gap-4">
              {heroSliderData.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className="flex-1 max-w-[80px] sm:max-w-[100px] flex flex-col gap-1.5 group"
                >
                  <ProgressBar
                    isActive={i === current}
                    duration={autoPlayInterval}
                  />
                </button>
              ))}

              {/* Slide counter */}
              <span className="ml-auto text-white/60 text-xs sm:text-sm font-mono tracking-widest select-none">
                {String(current + 1).padStart(2, "0")} /{" "}
                {String(heroSliderData.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}