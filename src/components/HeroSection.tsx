"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import RoleRotator from "./RoleRotator";

const CF = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P";

const HERO_VIDEOS = [
  `${CF}/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4`,
  `${CF}/hf_20260319_055001_8e16d972-3b2b-441c-86ad-2901a54682f9.mp4`,
  `${CF}/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4`,
  `${CF}/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4`,
  `${CF}/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4`,
];

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollReady, setScrollReady] = useState(false);

  // Scroll cue fades out as the user starts scrolling past the hero.
  const { scrollY } = useScroll();
  const cueOpacity = useTransform(scrollY, [0, 120], [1, 0]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const url = HERO_VIDEOS[Math.floor(Math.random() * HERO_VIDEOS.length)];
    video.src = url;
    video.playbackRate = 0.70;
    video.load();
    // Delay scroll cue until hero content has landed so it doesn't fight
    // with the entrance choreography.
    const t = setTimeout(() => setScrollReady(true), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex items-center px-8 md:px-16 lg:px-20 overflow-hidden"
      style={{
        // Override CSS variables so child components (e.g. RoleRotator) render
        // in light tones over the dark video background
        "--text-secondary": "rgba(255, 255, 255, 0.55)",
        "--text-primary": "#FFFFFF",
      } as React.CSSProperties}
    >
      {/* Background video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Dark overlay so text is readable */}
      <div className="absolute inset-0 bg-black/30 z-[1]" />

      {/* Bottom gradient fade to page background */}
      <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-[var(--bg-primary)] to-transparent z-[2]" />

      {/* Content */}
      <div className="relative z-10 flex items-center w-full gap-12 lg:gap-16">
        <div className="w-full max-w-xl lg:flex-shrink-0">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-[44px] sm:text-[58px] md:text-[82px] lg:text-[104px] leading-[110%] tracking-tight mb-8 text-white"
            style={{ fontFamily: "var(--font-instrument-serif)", textShadow: "0 2px 40px rgba(0,0,0,0.55), 0 0 80px rgba(0,0,0,0.3)" }}
          >
            Your path to becoming a 100x{" "}
            <RoleRotator />
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="text-[17px] max-w-md mb-8 leading-[140%] text-white/70"
            style={{ textShadow: "0 1px 20px rgba(0,0,0,0.6)" }}
          >
            Frameworks, mental models, and real resources to 100x your craft. No
            matter where you are on the journey. Let&apos;s go.
          </motion.p>
          <motion.a
            href="#learn"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="inline-flex items-center gap-2 text-[17px] font-medium group text-white/70 hover:text-white transition-colors px-4 py-2 rounded-full backdrop-blur-sm"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            Explore the learning paths
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="transition-transform duration-200 group-hover:translate-x-1"
            >
              <path
                d="M6 4l4 4-4 4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.a>
        </div>
      </div>

      {/* Scroll cue - fades out as the reader starts scrolling */}
      <motion.div
        aria-hidden="true"
        style={{ opacity: cueOpacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
      >
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={scrollReady ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/55">
            Scroll
          </span>
          <motion.svg
            width="14"
            height="20"
            viewBox="0 0 14 20"
            fill="none"
            animate={{ y: [0, 6, 0] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: [0.25, 1, 0.5, 1],
            }}
          >
            <path
              d="M7 2v14m0 0l-5-5m5 5l5-5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/55"
            />
          </motion.svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
