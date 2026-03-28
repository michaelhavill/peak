"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function FooterCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 md:py-32 px-8 md:px-16 lg:px-20" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="max-w-3xl">
        <h2 className="text-[42px] md:text-[56px] leading-[1.05] mb-6" style={{ fontFamily: "var(--font-instrument-serif)", color: "var(--text-primary)" }}>The 99% are getting commoditized.{" "}<span style={{ color: "var(--text-secondary)" }}>Build your moat.</span></h2>
        <p className="text-[16px] leading-relaxed mb-10" style={{ color: "var(--text-secondary)" }}>Your taste, your craft, your domain knowledge — encoded into an AI stack no one else can replicate. That&apos;s how you become irreplaceable. For your career and every company you touch. We&apos;re going to win.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="#" className="h-11 px-7 rounded-full text-[14px] font-medium inline-flex items-center justify-center transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--text-primary)", color: "var(--bg-primary)" }}>Build your moat</a>
          <a href="#" className="h-11 px-7 rounded-full text-[14px] font-medium inline-flex items-center justify-center transition-colors hover:bg-[var(--bg-elevated)]" style={{ border: "1px solid var(--border-medium)", color: "var(--text-primary)" }}>See the framework</a>
        </div>
      </motion.div>
    </section>
  );
}
