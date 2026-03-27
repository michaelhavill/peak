"use client";

import { motion } from "framer-motion";
import RoleRotator from "./RoleRotator";

export default function HeroSection() {
  return (
    <section id="hero" className="min-h-screen flex items-center px-8 md:px-16 lg:px-20">
      <div className="max-w-3xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-[48px] sm:text-[54px] md:text-[70px] lg:text-[90px] leading-[110%] tracking-tight mb-8"
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
          Frameworks, mental models, and curated resources to 100x your craft — no matter where you are on the journey.
        </motion.p>
        <motion.a
          href="#philosophy"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="inline-flex items-center gap-2 text-[15px] font-medium group"
          style={{ color: "var(--text-secondary)" }}
        >
          See what 100x looks like
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="transition-transform duration-200 group-hover:translate-x-1">
            <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.a>
      </div>
    </section>
  );
}
