"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { COMMAND_TABS } from "@/lib/constants";

function MockUI({ variant }: { variant: string }) {
  const rows = variant === "learning-path" ? 5 : 4;
  return (
    <div className="w-full rounded-lg p-6" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="flex items-center gap-2 mb-6">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FF5F56" }} />
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FFBD2E" }} />
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#27C93F" }} />
        <div className="ml-4 flex-1 h-7 rounded-md" style={{ backgroundColor: "var(--bg-elevated)" }} />
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-3 rounded" style={{ backgroundColor: i === 1 ? "var(--text-primary)" : "var(--bg-elevated)", opacity: i === 1 ? 0.15 : 0.8, width: `${60 + ((i * 37 + 13) % 40)}%` }} />
          ))}
        </div>
        <div className="col-span-3 space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)", opacity: 0.5 + i * 0.1 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CommandCenter() {
  const [activeTab, setActiveTab] = useState(COMMAND_TABS[0].id);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const active = COMMAND_TABS.find((t) => t.id === activeTab)!;

  return (
    <section id="surfaces" className="py-20 md:py-28 px-8 md:px-16 lg:px-20" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <div className="max-w-5xl" ref={ref}>
        <motion.h2 initial={{ opacity: 0, y: 16 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }} className="text-xl md:text-2xl font-medium mb-12">Where your moat compounds — shared surfaces for humans and AI</motion.h2>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="flex gap-3 mb-8">
            {COMMAND_TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="h-9 px-5 rounded-full text-[13px] font-medium transition-all duration-200" style={{ backgroundColor: activeTab === tab.id ? "var(--text-primary)" : "transparent", color: activeTab === tab.id ? "var(--bg-primary)" : "var(--text-secondary)", border: activeTab === tab.id ? "1px solid var(--text-primary)" : "1px solid var(--border-medium)" }}>
                {tab.title}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.p key={active.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="max-w-lg mb-8 text-[15px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{active.description}</motion.p>
          </AnimatePresence>
          <div className="rounded-xl overflow-hidden p-1.5" style={{ border: "1px solid var(--border-subtle)" }}>
            <AnimatePresence mode="wait">
              <motion.div key={active.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <MockUI variant={active.id} />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
