"use client";

import { useState, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  html: string;
}

export default function MethodModal({
  isOpen,
  onClose,
  title,
  html,
}: MethodModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [formState, setFormState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
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
      setFormState("idle");
      setErrorMsg("");
    }, 300);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, topic }),
      });

      const data = (await res.json()) as {
        success: boolean;
        error?: string;
      };

      if (data.success) {
        setFormState("success");
        setName("");
        setEmail("");
        setTopic("");
      } else {
        setErrorMsg(data.error ?? "Something went wrong.");
        setFormState("error");
      }
    } catch {
      setErrorMsg("Connection failed. Try again.");
      setFormState("error");
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
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(4px)",
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-3xl rounded-xl py-8 px-6 md:px-10 my-auto"
            style={{
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-[var(--bg-elevated)]"
              style={{ color: "var(--text-tertiary)" }}
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M12 4L4 12M4 4l8 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* Label */}
            <p
              className="text-[11px] font-medium uppercase tracking-widest mb-3"
              style={{ color: "var(--text-tertiary)" }}
            >
              How to
            </p>

            {/* Title */}
            <h2
              className="text-[24px] md:text-[32px] leading-[1.15] mb-8"
              style={{
                fontFamily: "var(--font-instrument-serif)",
                color: "var(--text-primary)",
              }}
            >
              {title}
            </h2>

            {/* Method content */}
            <article
              className="prose-100x mb-12"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {/* Divider */}
            <div
              className="h-px mb-8"
              style={{ backgroundColor: "var(--border-subtle)" }}
            />

            {/* Consultation form */}
            <AnimatePresence mode="wait">
              {formState === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-6"
                >
                  <p
                    className="text-[24px] md:text-[28px] mb-2"
                    style={{
                      fontFamily: "var(--font-instrument-serif)",
                      color: "var(--text-primary)",
                    }}
                  >
                    Request received.
                  </p>
                  <p
                    className="text-[14px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    I&apos;ll be in touch within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <motion.div key="form" exit={{ opacity: 0 }}>
                  <p
                    className="text-[11px] font-medium uppercase tracking-widest mb-3"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Want to go deeper?
                  </p>
                  <h3
                    className="text-[20px] md:text-[24px] leading-[1.15] mb-2"
                    style={{
                      fontFamily: "var(--font-instrument-serif)",
                      color: "var(--text-primary)",
                    }}
                  >
                    Request a consultation call
                  </h3>
                  <p
                    className="text-[14px] leading-relaxed mb-6"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Want help implementing this for your specific situation?
                    Let&apos;s talk.
                  </p>

                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-3 max-w-md"
                  >
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                      className="h-11 px-5 rounded-full text-[14px] w-full outline-none transition-shadow"
                      style={{
                        border: "1px solid var(--border-medium)",
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 0 0 2px var(--accent-highlight)";
                        e.currentTarget.style.borderColor =
                          "var(--accent-highlight)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.borderColor =
                          "var(--border-medium)";
                      }}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      required
                      className="h-11 px-5 rounded-full text-[14px] w-full outline-none transition-shadow"
                      style={{
                        border: `1px solid ${formState === "error" ? "#C85450" : "var(--border-medium)"}`,
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 0 0 2px var(--accent-highlight)";
                        e.currentTarget.style.borderColor =
                          "var(--accent-highlight)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.borderColor =
                          formState === "error"
                            ? "#C85450"
                            : "var(--border-medium)";
                      }}
                    />
                    <textarea
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="What would you like to consult about?"
                      required
                      rows={3}
                      className="px-5 py-3 rounded-2xl text-[14px] w-full outline-none transition-shadow resize-none"
                      style={{
                        border: "1px solid var(--border-medium)",
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 0 0 2px var(--accent-highlight)";
                        e.currentTarget.style.borderColor =
                          "var(--accent-highlight)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.borderColor =
                          "var(--border-medium)";
                      }}
                    />
                    <button
                      type="submit"
                      disabled={formState === "loading"}
                      className="h-11 px-7 rounded-full text-[14px] font-medium inline-flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-60 whitespace-nowrap"
                      style={{
                        backgroundColor: "var(--text-primary)",
                        color: "var(--bg-primary)",
                      }}
                    >
                      {formState === "loading"
                        ? "Sending..."
                        : "Request a call"}
                    </button>
                  </form>

                  {formState === "error" && errorMsg && (
                    <p
                      className="text-[12px] mt-3"
                      style={{ color: "#C85450" }}
                    >
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
