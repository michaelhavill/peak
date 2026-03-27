"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ROLE_TASKS } from "@/lib/constants";

export default function RolePaths() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 md:py-28 px-8 md:px-16 lg:px-20" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <div className="max-w-5xl" ref={ref}>
        <motion.h2 initial={{ opacity: 0, y: 16 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }} className="text-xl md:text-2xl font-medium mb-4">The path from commoditized to irreplaceable</motion.h2>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.05 }} className="text-[15px] mb-12" style={{ color: "var(--text-secondary)" }}>
          99% of people use AI the same way. You&apos;re building the moat that puts you in the 1% — for your career and for every company you touch.
        </motion.p>
        <div className="grid md:grid-cols-2 gap-5 items-start">
          <motion.div initial={{ opacity: 0, x: -16 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 }} className="rounded-xl p-6" style={{ border: "1px solid var(--border-subtle)" }}>
            <div className="space-y-4">
              {ROLE_TASKS.map((task, i) => (
                <motion.div key={task} initial={{ opacity: 0.3 }} animate={isInView ? { opacity: 1 } : { opacity: 0.3 }} transition={{ duration: 0.5, delay: 0.4 + i * 0.35 }} className="flex items-center gap-3">
                  <motion.div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ border: "1.5px solid var(--border-medium)", backgroundColor: "transparent" }} animate={isInView ? { backgroundColor: "var(--text-primary)", borderColor: "var(--text-primary)" } : {}} transition={{ duration: 0.3, delay: 0.6 + i * 0.35 }}>
                    <motion.svg width="12" height="12" viewBox="0 0 12 12" fill="none" initial={{ opacity: 0, scale: 0 }} animate={isInView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.2, delay: 0.8 + i * 0.35 }}>
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                  </motion.div>
                  <span className="text-[14px]" style={{ color: "var(--text-primary)" }}>{task}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 16 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5, delay: 0.15 }} className="rounded-xl p-7" style={{ border: "1px solid var(--border-subtle)" }}>
            <h3 className="text-2xl mb-3" style={{ fontFamily: "var(--font-instrument-serif)" }}>The Moat Builder</h3>
            <p className="text-[14px] leading-relaxed mb-5" style={{ color: "var(--text-secondary)" }}>You become the person who makes AI defensible — for yourself and for the companies you work with. Your knowledge base is the competitive advantage no one can replicate or outsource.</p>
            <div className="flex flex-wrap gap-2">
              {["Founder", "Design Engineer", "Solo Operator", "Tech Lead", "Vibe Coder"].map((role) => (
                <span key={role} className="text-[12px] px-3 py-1 rounded-full font-medium" style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-secondary)" }}>{role}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
