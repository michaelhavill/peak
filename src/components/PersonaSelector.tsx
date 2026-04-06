"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PERSONAS = [
  { id: "general", label: "General" },
  { id: "founder", label: "Founder" },
  { id: "product-builder", label: "Product Builder" },
  { id: "product-designer", label: "Product Designer" },
  { id: "design-engineer", label: "Design Engineer" },
  { id: "solo-operator", label: "Solo Operator" },
  { id: "technical-leader", label: "Technical Leader" },
  { id: "creative-director", label: "Creative Director" },
  { id: "vibe-coder", label: "Vibe Coder" },
] as const;

export type PersonaId = (typeof PERSONAS)[number]["id"];

interface PersonaSelectorProps {
  selected: PersonaId;
  onChange: (id: PersonaId) => void;
}

export default function PersonaSelector({
  selected,
  onChange,
}: PersonaSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="mb-10 py-5 px-5 md:px-6 rounded-xl"
      style={{
        backgroundColor: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-[11px] font-medium uppercase tracking-widest"
          style={{ color: "var(--text-tertiary)" }}
        >
          Read this as a...
        </p>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[12px] md:hidden transition-colors"
          style={{ color: "var(--text-secondary)" }}
        >
          {isExpanded ? "Show less" : "Show all"}
        </button>
      </div>

      <div
        className={`flex flex-wrap gap-2 ${
          !isExpanded ? "max-h-[40px] md:max-h-none overflow-hidden" : ""
        }`}
      >
        {PERSONAS.map((persona) => {
          const isSelected = selected === persona.id;
          return (
            <button
              key={persona.id}
              onClick={() => onChange(persona.id)}
              className="relative h-[34px] px-4 rounded-full text-[13px] font-medium transition-colors whitespace-nowrap"
              style={{
                backgroundColor: isSelected
                  ? "var(--text-primary)"
                  : "var(--bg-secondary)",
                color: isSelected
                  ? "var(--bg-primary)"
                  : "var(--text-secondary)",
                border: isSelected
                  ? "1px solid var(--text-primary)"
                  : "1px solid var(--border-medium)",
              }}
            >
              {persona.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { PERSONAS };
