"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import RoleRotator from "./RoleRotator";

const CF = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P";

const HERO_VIDEOS = [
  `${CF}/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4`,
  `${CF}/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4`,
  `${CF}/hf_20260306_074215_04640ca7-042c-45d6-bb56-58b1e8a42489.mp4`,
];

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl] = useState(
    () => HERO_VIDEOS[Math.floor(Math.random() * HERO_VIDEOS.length)]
  );

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = 0.70;
  }, []);

  return (
    <section
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
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

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
            className="text-[36px] sm:text-[48px] md:text-[70px] lg:text-[90px] leading-[110%] tracking-tight mb-8 text-white"
            style={{ fontFamily: "var(--font-instrument-serif)", textShadow: "0 2px 40px rgba(0,0,0,0.55), 0 0 80px rgba(0,0,0,0.3)" }}
          >
            Your path to becoming a 100x{" "}
            <RoleRotator />
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="text-[15px] max-w-md mb-8 leading-[140%] text-white/70"
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
            className="inline-flex items-center gap-2 text-[15px] font-medium group text-white/70 hover:text-white transition-colors px-4 py-2 rounded-full backdrop-blur-sm"
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
    </section>
  );
}
