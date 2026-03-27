"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TESTIMONIALS } from "@/lib/constants";

export default function TestimonialsCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section id="testimonials" className="py-20 md:py-28 px-8 md:px-16 lg:px-20" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <div className="max-w-5xl" ref={ref}>
        <motion.h2 initial={{ opacity: 0, y: 16 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }} className="text-xl md:text-2xl font-medium mb-12">What builders are saying</motion.h2>
      </div>
      <div className="overflow-hidden">
        <motion.div
          className="flex gap-6"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {doubled.map((t, i) => (
            <div key={`${t.name}-${i}`} className="flex-shrink-0 w-[340px] md:w-[400px] rounded-xl p-6" style={{ border: "1px solid var(--border-subtle)" }}>
              <p className="text-[14px] leading-relaxed mb-6" style={{ color: "var(--text-primary)" }}>&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold text-white" style={{ backgroundColor: t.color }}>{t.initials}</div>
                <div>
                  <div className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>{t.name}</div>
                  <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
