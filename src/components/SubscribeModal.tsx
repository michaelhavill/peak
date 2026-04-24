"use client";

import { useState, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { subscribe } from "@/lib/newsletter";

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscribeModal({ isOpen, onClose }: SubscribeModalProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen, onClose]);

  function handleClose() {
    onClose();
    setTimeout(() => {
      setState("idle");
      setEmail("");
      setErrorMsg("");
    }, 300);
  }

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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(4px)" }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md rounded-xl py-10 px-8 md:px-10"
            style={{
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-[var(--bg-secondary)]"
              style={{ color: "var(--text-tertiary)" }}
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

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
                    className="text-[28px] md:text-[34px] mb-2"
                    style={{
                      fontFamily: "var(--font-instrument-serif)",
                      color: "var(--text-primary)",
                    }}
                  >
                    Check your inbox.
                  </p>
                  <p className="text-[16px]" style={{ color: "var(--text-secondary)" }}>
                    Welcome to the 1%.
                  </p>
                </motion.div>
              ) : (
                <motion.div key="form" exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <p
                    className="text-[13px] font-medium uppercase tracking-widest mb-4"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Newsletter
                  </p>
                  <h3
                    className="text-[28px] md:text-[34px] leading-[1.1] mb-3"
                    style={{
                      fontFamily: "var(--font-instrument-serif)",
                      color: "var(--text-primary)",
                    }}
                  >
                    Stay ahead of the 99%
                  </h3>
                  <p
                    className="text-[17px] leading-relaxed mb-8"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Frameworks, strategies, and real examples for building your
                    knowledge moat - delivered straight to your inbox.
                  </p>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (state === "error") setState("idle");
                      }}
                      placeholder="Your email address"
                      required
                      autoFocus
                      className="h-11 px-5 rounded-full text-[16px] w-full outline-none transition-shadow"
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
                      className="h-11 px-7 rounded-full text-[16px] font-medium inline-flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-60 whitespace-nowrap w-full"
                      style={{
                        backgroundColor: "var(--text-primary)",
                        color: "var(--bg-primary)",
                      }}
                    >
                      {state === "loading" ? "Subscribing..." : "Subscribe"}
                    </button>
                  </form>

                  {state === "error" && errorMsg && (
                    <p className="text-[14px] mt-3" style={{ color: "#C85450" }}>
                      {errorMsg}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
