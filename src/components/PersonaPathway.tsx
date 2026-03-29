"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PERSONAS, PERSONA_CONTENT } from "@/lib/persona-content";

export default function PersonaPathway({ slug }: { slug: string }) {
  const content = PERSONA_CONTENT[slug];
  const [activeId, setActiveId] = useState<string | null>(null);

  if (!content) return null;

  const active = content.find((p) => p.id === activeId);

  return (
    <section className="mt-16 pt-12" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <p
        className="text-[12px] font-medium uppercase tracking-widest mb-4"
        style={{ color: "var(--text-secondary)" }}
      >
        What this means for you
      </p>
      <h2
        className="text-[24px] md:text-[30px] leading-[1.15] mb-3"
        style={{
          fontFamily: "var(--font-instrument-serif)",
          color: "var(--text-primary)",
        }}
      >
        Pick your role. See the difference.
      </h2>
      <p
        className="text-[14px] mb-8 leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        The same path, applied to your world. Click your role to see how this changes your work.
      </p>

      {/* Persona pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveId(activeId === p.id ? null : p.id)}
            className="text-[12px] px-4 py-1.5 rounded-full font-medium transition-all duration-200"
            style={{
              backgroundColor:
                activeId === p.id
                  ? "var(--text-primary)"
                  : "var(--bg-elevated)",
              color:
                activeId === p.id
                  ? "var(--bg-primary)"
                  : "var(--text-secondary)",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Content panel */}
      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {/* Today vs 100x - two columns */}
            <div
              className="rounded-xl overflow-hidden mb-4"
              style={{ border: "1px solid var(--border-subtle)" }}
            >
              <div className="flex flex-col md:flex-row">
                <div
                  className="flex-1 p-6"
                  style={{ backgroundColor: "var(--bg-primary)" }}
                >
                  <div
                    className="text-[11px] font-medium uppercase tracking-widest mb-3"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    How it works today
                  </div>
                  <p
                    className="text-[14px] leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {active.today}
                  </p>
                </div>
                <div
                  className="hidden md:block w-px"
                  style={{ backgroundColor: "var(--border-subtle)" }}
                />
                <div
                  className="md:hidden h-px"
                  style={{ backgroundColor: "var(--border-subtle)" }}
                />
                <div
                  className="flex-1 p-6"
                  style={{ backgroundColor: "var(--bg-secondary)" }}
                >
                  <div
                    className="text-[11px] font-medium uppercase tracking-widest mb-3"
                    style={{ color: "var(--text-primary)" }}
                  >
                    The 100x way
                  </div>
                  <p
                    className="text-[14px] leading-relaxed"
                    style={{ color: "var(--text-primary)" }}
                    dangerouslySetInnerHTML={{
                      __html: active.hundredX.replace(
                        /\*\*([^*]+)\*\*/g,
                        '<strong>$1</strong>'
                      ),
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Impact + Example */}
            <div className="grid md:grid-cols-2 gap-4">
              <div
                className="rounded-xl p-6"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                }}
              >
                <div
                  className="text-[11px] font-medium uppercase tracking-widest mb-3"
                  style={{ color: "var(--text-secondary)" }}
                >
                  The impact
                </div>
                <p
                  className="text-[14px] leading-relaxed font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {active.impact}
                </p>
              </div>
              <div
                className="rounded-xl p-6"
                style={{
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  className="text-[11px] font-medium uppercase tracking-widest mb-3"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Real example
                </div>
                <p
                  className="text-[14px] leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {active.example}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
