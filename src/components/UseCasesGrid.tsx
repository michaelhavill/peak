"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { USE_CASES } from "@/lib/constants";

export default function UseCasesGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="philosophy" className="py-20 md:py-28 px-8 md:px-16 lg:px-20" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <div className="max-w-5xl mx-auto" ref={ref}>
        <motion.h2 initial={{ opacity: 0, y: 16 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }} className="text-xl md:text-2xl font-medium mb-12">
          Build the moat: knowledge that can&apos;t be copied
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border-subtle)] rounded-xl overflow-hidden border border-[var(--border-subtle)]">
          {USE_CASES.map((item, i) => (
            <motion.a key={item.title} href="#" initial={{ opacity: 0, y: 16 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4, delay: i * 0.06 }} className="group p-7 flex flex-col transition-colors duration-200 hover:bg-[var(--bg-elevated)]" style={{ backgroundColor: "var(--bg-secondary)" }}>
              <div className="flex items-center gap-2 mb-5">
                {item.tools.map((tool) => (
                  <div key={tool} className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-semibold" style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
                    {tool.charAt(0)}
                  </div>
                ))}
              </div>
              <h3 className="text-[15px] font-medium mb-2 leading-snug" style={{ color: "var(--text-primary)" }}>{item.title}</h3>
              <p className="text-[13px] leading-relaxed mb-5 flex-1" style={{ color: "var(--text-secondary)" }}>{item.description}</p>
              <span className="text-[13px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ color: "var(--text-secondary)" }}>Build this &rarr;</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
