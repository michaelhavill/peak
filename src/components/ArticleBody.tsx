"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PersonaSelector, { type PersonaId } from "./PersonaSelector";
import MethodModal from "./MethodModal";
import EmailCapture from "./EmailCapture";

export interface ArticleSection {
  type: "why" | "method";
  html: string;
  id?: string;
  title?: string;
  triggerText?: string;
}

export interface PersonaVariants {
  [personaId: string]: {
    sections: ArticleSection[];
  };
}

interface ArticleBodyProps {
  variants: PersonaVariants;
  fallbackHtml: string;
}

export default function ArticleBody({
  variants,
  fallbackHtml,
}: ArticleBodyProps) {
  const [persona, setPersona] = useState<PersonaId>("general");
  const [openMethod, setOpenMethod] = useState<ArticleSection | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("path-persona") as PersonaId | null;
    if (saved && variants[saved]) {
      setPersona(saved);
    }
  }, [variants]);

  const handlePersonaChange = useCallback(
    (id: PersonaId) => {
      setPersona(id);
      localStorage.setItem("path-persona", id);
    },
    []
  );

  // If no variants loaded or not mounted yet, show fallback
  const currentVariant = variants[persona] ?? variants["general"];
  if (!mounted || !currentVariant) {
    return (
      <article
        className="prose-100x"
        dangerouslySetInnerHTML={{ __html: fallbackHtml }}
      />
    );
  }

  const sections = currentVariant.sections;

  // Find the split point for the teaser EmailCapture (~25% through WHY sections)
  const whySections = sections.filter((s) => s.type === "why");
  const totalWhyLength = whySections.reduce((acc, s) => acc + s.html.length, 0);
  let teaserInsertedAfter = -1;
  let cumulative = 0;
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].type === "why") {
      cumulative += sections[i].html.length;
      if (cumulative >= totalWhyLength * 0.25 && teaserInsertedAfter === -1) {
        teaserInsertedAfter = i;
      }
    }
  }

  return (
    <>
      <PersonaSelector selected={persona} onChange={handlePersonaChange} />

      <AnimatePresence mode="wait">
        <motion.div
          key={persona}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {sections.map((section, i) => {
            if (section.type === "why") {
              return (
                <div key={`section-${i}`}>
                  <article
                    className="prose-100x"
                    dangerouslySetInnerHTML={{ __html: section.html }}
                  />
                  {i === teaserInsertedAfter && (
                    <EmailCapture variant="teaser" />
                  )}
                </div>
              );
            }

            // Method trigger
            return (
              <button
                key={section.id ?? `method-${i}`}
                onClick={() => setOpenMethod(section)}
                className="group w-full text-left my-6 py-4 px-5 md:px-6 rounded-lg transition-all"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--text-secondary)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 1px var(--text-secondary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[15px] mb-1 italic"
                      style={{
                        color: "var(--text-secondary)",
                        fontFamily: "var(--font-instrument-serif)",
                      }}
                    >
                      How to
                    </p>
                    <p
                      className="text-[15px] font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {section.triggerText ?? section.title ?? "See the details"}
                    </p>
                  </div>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="shrink-0 transition-transform group-hover:translate-x-0.5"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    <path
                      d="M7 5l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <MethodModal
        isOpen={openMethod !== null}
        onClose={() => setOpenMethod(null)}
        title={openMethod?.title ?? ""}
        html={openMethod?.html ?? ""}
      />
    </>
  );
}
