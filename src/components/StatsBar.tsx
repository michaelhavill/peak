"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import { STATS } from "@/lib/constants";

export default function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 md:py-28 px-8 md:px-16 lg:px-20" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <motion.div ref={ref} initial={{ opacity: 0, y: 16 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }} className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-medium mb-12">The moat gap</h2>
        <div className="flex flex-col md:flex-row gap-16 md:gap-24">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="text-[64px] md:text-[76px] font-light mb-2 tabular-nums leading-none" style={{ fontFamily: "var(--font-instrument-serif)", color: "var(--text-primary)" }}>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-[16px]" style={{ color: "var(--text-secondary)" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
