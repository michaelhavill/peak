"use client";

import { useEffect } from "react";

/**
 * Short greeting for anyone who opens DevTools. Fires once per session.
 * Operators and engineers often peek at the console - this turns that into
 * a small human moment instead of a silent page.
 */
export default function ConsoleGreeting() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const FLAG = "path100x_console_greeting";
    try {
      if (sessionStorage.getItem(FLAG)) return;
      sessionStorage.setItem(FLAG, "1");
    } catch {
      return;
    }

    const title = "100x Path";
    const sub =
      "If you're poking at the console, you're probably my kind of operator.";
    const tail = "mvh@mindspan.co";

    // Serif-styled title, warm rest. Kept short so it doesn't become noise.
    // Chrome/Safari/Firefox all honor %c style runs.
    console.log(
      `%c${title}%c\n${sub}\n${tail}`,
      "font: 600 20px ui-serif, Georgia, serif; color: #4A7550; padding-top: 8px;",
      "font: 14px ui-sans-serif, system-ui, sans-serif; color: #6B6B6B; line-height: 1.6;"
    );
  }, []);

  return null;
}
