"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { INTEGRATIONS } from "@/lib/constants";

export default function IntegrationsGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="resources" className="py-20 md:py-28 px-8 md:px-16 lg:px-20" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <div className="max-w-5xl" ref={ref}>
        <motion.h2 initial={{ opacity: 0, y: 16 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }} className="text-xl md:text-2xl font-medium mb-4">Integrations</motion.h2>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.05 }} className="text-[15px] mb-12" style={{ color: "var(--text-secondary)" }}>Resources from the tools you already use.</motion.p>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-5 md:gap-6">
          {INTEGRATIONS.map((name, i) => (
            <motion.div key={name} initial={{ opacity: 0, scale: 0.95 }} animate={isInView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.3, delay: i * 0.03 }} className="flex flex-col items-center gap-2 group cursor-default">
              <div className="transition-transform duration-200 group-hover:scale-105 group-hover:-translate-y-1">
                <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-semibold" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>{name.charAt(0)}</div>
              </div>
              <span className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>{name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
