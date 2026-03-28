"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import RoleRotator from "./RoleRotator";

const HERO_IMAGES = [
  { src: "/hero/founder.png",          alt: "A founder sketching plans in an empty studio" },
  { src: "/hero/product-builder.png",  alt: "A product builder assembling pieces at a workbench" },
  { src: "/hero/design-engineer.png",  alt: "A design engineer bridging sketch and structure" },
  { src: "/hero/solo-operator.png",    alt: "A solo operator running everything from one desk" },
  { src: "/hero/technical-leader.png", alt: "A technical leader at the whiteboard with their team" },
  { src: "/hero/creative-director.png",alt: "A creative director surveying a wall of work" },
  { src: "/hero/vibe-coder.png",       alt: "A vibe coder deep in flow on a cosy afternoon" },
];

export default function HeroSection() {
  const [heroImage, setHeroImage] = useState(HERO_IMAGES[0]);

  useEffect(() => {
    setHeroImage(HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)]);
  }, []);

  return (
    <section id="hero" className="min-h-screen flex items-center px-8 md:px-16 lg:px-20 overflow-hidden">
      <div className="flex items-center w-full gap-12 lg:gap-16">
      <div className="w-full max-w-xl lg:flex-shrink-0">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-[36px] sm:text-[48px] md:text-[70px] lg:text-[90px] leading-[110%] tracking-tight mb-8"
          style={{ fontFamily: "var(--font-instrument-serif)", color: "var(--text-primary)" }}
        >
          Your path to becoming a 100x{" "}
          <RoleRotator />
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="text-[15px] max-w-md mb-8 leading-[140%]"
          style={{ color: "var(--text-secondary)" }}
        >
          Frameworks, mental models, and real resources to 100x your craft. No matter where you are on the journey. Let&apos;s go.
        </motion.p>
        <motion.a
          href="#philosophy"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="inline-flex items-center gap-2 text-[15px] font-medium group"
          style={{ color: "var(--text-secondary)" }}
        >
          See the framework
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="transition-transform duration-200 group-hover:translate-x-1">
            <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.a>
      </div>
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="hidden lg:block flex-1 min-w-0"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImage.src}
          alt={heroImage.alt}
          className="w-full h-[70vh] object-cover rounded-2xl"
        />
      </motion.div>
      </div>
    </section>
  );
}
