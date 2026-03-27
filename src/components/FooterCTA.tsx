"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function FooterCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 md:py-32 px-8 md:px-16 lg:px-20" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="max-w-3xl">
        <h2 className="text-[42px] md:text-[56px] leading-[1.05] mb-6" style={{ fontFamily: "var(--font-instrument-serif)", color: "var(--text-primary)" }}>Ready to build with AI peers?</h2>
        <p className="text-[16px] leading-relaxed mb-10" style={{ color: "var(--text-secondary)" }}>Join builders who are documenting their craft, unleashing agentic workflows, and turning one person into a hundred.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="#" className="h-11 px-7 rounded-full text-[14px] font-medium inline-flex items-center justify-center transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--text-primary)", color: "var(--bg-primary)" }}>Start building</a>
          <a href="#" className="h-11 px-7 rounded-full text-[14px] font-medium inline-flex items-center justify-center transition-colors hover:bg-[var(--bg-elevated)]" style={{ border: "1px solid var(--border-medium)", color: "var(--text-primary)" }}>See the framework</a>
        </div>
      </motion.div>
    </section>
  );
}
