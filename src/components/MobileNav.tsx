"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_ITEMS } from "@/lib/constants";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-5"
        style={{
          backgroundColor: "rgba(250, 250, 248, 0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <a href="#" className="text-base font-medium" style={{ fontFamily: "var(--font-instrument-serif)" }}>
          Path to 100x
        </a>
        <button onClick={() => setOpen(!open)} className="flex flex-col gap-1 p-2" aria-label="Toggle menu">
          <span className="block w-5 h-[1.5px] transition-transform duration-200" style={{ backgroundColor: "var(--text-primary)", transform: open ? "rotate(45deg) translate(2px, 2px)" : "none" }} />
          <span className="block w-5 h-[1.5px] transition-opacity duration-200" style={{ backgroundColor: "var(--text-primary)", opacity: open ? 0 : 1 }} />
          <span className="block w-5 h-[1.5px] transition-transform duration-200" style={{ backgroundColor: "var(--text-primary)", transform: open ? "rotate(-45deg) translate(2px, -2px)" : "none" }} />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 z-40 flex flex-col items-start justify-center gap-6 px-8 pt-14"
            style={{ backgroundColor: "var(--bg-primary)" }}
          >
            {NAV_ITEMS.map((item, i) => (
              <motion.a key={item.href} href={item.href} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04, duration: 0.3 }} className="text-3xl" style={{ fontFamily: "var(--font-instrument-serif)", color: "var(--text-primary)" }} onClick={() => setOpen(false)}>
                {item.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
