"use client";

import { useState, useRef, type FormEvent } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { subscribe } from "@/lib/newsletter";

interface EmailCaptureProps {
  variant: "inline" | "compact";
}

export default function EmailCapture({ variant }: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");

    const result = await subscribe(email);

    if (result.success) {
      setState("success");
      setEmail("");
    } else {
      setErrorMsg(result.error ?? "Something went wrong.");
      setState("error");
    }
  }

  if (variant === "compact") {
    return (
      <div ref={ref}>
        <AnimatePresence mode="wait">
          {state === "success" ? (
            <motion.p
              key="success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-[14px] font-medium h-11 flex items-center"
              style={{ color: "var(--text-primary)" }}
            >
              You&apos;re in. Check your inbox.
            </motion.p>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state === "error") setState("idle");
                }}
                placeholder="Enter your email"
                required
                className="h-11 px-5 rounded-full text-[14px] flex-1 min-w-0 outline-none transition-shadow"
                style={{
                  border: `1px solid ${state === "error" ? "#C85450" : "var(--border-medium)"}`,
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent-highlight)";
                  e.currentTarget.style.borderColor = "var(--accent-highlight)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = state === "error" ? "#C85450" : "var(--border-medium)";
                }}
              />
              <button
                type="submit"
                disabled={state === "loading"}
                className="h-11 px-7 rounded-full text-[14px] font-medium inline-flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-60 whitespace-nowrap"
                style={{
                  backgroundColor: "var(--text-primary)",
                  color: "var(--bg-primary)",
                }}
              >
                {state === "loading" ? "..." : "Get the playbook"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
        {state === "error" && errorMsg && (
          <p className="text-[12px] mt-2" style={{ color: "#C85450" }}>
            {errorMsg}
          </p>
        )}
      </div>
    );
  }

  // Inline variant - for blog posts
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="my-14 py-10 px-8 md:px-10 rounded-xl"
      style={{
        backgroundColor: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <AnimatePresence mode="wait">
        {state === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center py-4"
          >
            <p
              className="text-[20px] md:text-[24px] mb-2"
              style={{
                fontFamily: "var(--font-instrument-serif)",
                color: "var(--text-primary)",
              }}
            >
              Check your inbox.
            </p>
            <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
              The playbook is on its way.
            </p>
          </motion.div>
        ) : (
          <motion.div key="form" exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <p
              className="text-[11px] font-medium uppercase tracking-widest mb-4"
              style={{ color: "var(--text-tertiary)" }}
            >
              Free playbook
            </p>
            <h3
              className="text-[24px] md:text-[28px] leading-[1.1] mb-3"
              style={{
                fontFamily: "var(--font-instrument-serif)",
                color: "var(--text-primary)",
              }}
            >
              Get the 100x Knowledge Moat Playbook
            </h3>
            <p
              className="text-[15px] leading-relaxed mb-8 max-w-lg"
              style={{ color: "var(--text-secondary)" }}
            >
              The 5 Pillars framework, the Specificity Spectrum, and the exact
              steps to build a knowledge moat no one can replicate - distilled
              into one actionable guide.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state === "error") setState("idle");
                }}
                placeholder="Your email address"
                required
                className="h-11 px-5 rounded-full text-[14px] flex-1 min-w-0 outline-none transition-shadow"
                style={{
                  border: `1px solid ${state === "error" ? "#C85450" : "var(--border-medium)"}`,
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent-highlight)";
                  e.currentTarget.style.borderColor = "var(--accent-highlight)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = state === "error" ? "#C85450" : "var(--border-medium)";
                }}
              />
              <button
                type="submit"
                disabled={state === "loading"}
                className="h-11 px-7 rounded-full text-[14px] font-medium inline-flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-60 whitespace-nowrap"
                style={{
                  backgroundColor: "var(--text-primary)",
                  color: "var(--bg-primary)",
                }}
              >
                {state === "loading" ? "Sending..." : "Send me the playbook"}
              </button>
            </form>

            {state === "error" && errorMsg && (
              <p className="text-[12px] mt-3" style={{ color: "#C85450" }}>
                {errorMsg}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
