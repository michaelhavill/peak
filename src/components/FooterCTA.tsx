"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import PretextReveal from "./PretextReveal";
import EmailCapture from "./EmailCapture";

export default function FooterCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 md:py-32 px-8 md:px-16 lg:px-20" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="max-w-5xl mx-auto">
        <PretextReveal
          text="The 99% are getting commoditized. Build your moat."
          font="56px 'Instrument Serif'"
          className="text-[42px] md:text-[56px] leading-[1.05] mb-6"
          style={{ fontFamily: "var(--font-instrument-serif)", color: "var(--text-primary)" }}
          lineDelay={0.1}
          duration={0.6}
          y={16}
        />
        <p className="text-[16px] leading-relaxed mb-10" style={{ color: "var(--text-secondary)" }}>Your taste, your craft, your domain knowledge - encoded into an AI stack no one else can replicate. That&apos;s how you become irreplaceable.</p>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/#learn" className="h-11 px-7 rounded-full text-[14px] font-medium inline-flex items-center justify-center transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--text-primary)", color: "var(--bg-primary)" }}>Read the playbook</a>
          </div>
          <div className="max-w-md">
            <p className="text-[12px] font-medium uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Or subscribe to the newsletter</p>
            <EmailCapture variant="compact" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
