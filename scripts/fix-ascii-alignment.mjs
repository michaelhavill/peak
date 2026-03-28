#!/usr/bin/env node
/**
 * Fix ASCII art alignment in blog markdown files.
 *
 * Every blog has a single fenced code block containing a box-drawing diagram.
 * The top border (┌───┐) defines the target visual width. This script pads or
 * trims each interior line so the closing │ lands at exactly the right column.
 *
 * Box-drawing characters (─ │ ┌ ┐ └ ┘ ┬ ┴ ├ ┤ ┼) are multi-byte UTF-8 but
 * occupy one visual column, same as ASCII chars. We measure visual width by
 * counting Unicode code points (spread into Array.from), which works because
 * none of these characters are full-width (CJK) or zero-width.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.join(__dirname, "..", "content", "blog");

// Visual width = number of Unicode code points (all chars here are single-width)
function visualWidth(line) {
  return Array.from(line).length;
}

function fixAsciiBlock(block) {
  const lines = block.split("\n");

  // Find the top border line (starts with ┌)
  const topIdx = lines.findIndex((l) => l.trimStart().startsWith("┌"));
  if (topIdx === -1) return block; // no box found

  const targetWidth = visualWidth(lines[topIdx]);

  const fixed = lines.map((line, i) => {
    // Don't touch the top/bottom border lines or empty lines
    if (i === topIdx) return line;
    const bottomIdx = lines.findLastIndex((l) => l.trimStart().startsWith("└"));
    if (i === bottomIdx) {
      // Fix bottom border to match top width
      return fixBorderLine(line, targetWidth, "└", "┘");
    }

    // Only fix lines that start with │ and end with │
    const trimmed = line.trimEnd();
    if (!trimmed.startsWith("│") || !trimmed.endsWith("│")) return line;

    const currentWidth = visualWidth(trimmed);

    if (currentWidth === targetWidth) return line; // already correct

    if (currentWidth < targetWidth) {
      const diff = targetWidth - currentWidth;
      const chars = Array.from(trimmed);

      // Special case: dashed separator lines (─ ─ ─ pattern)
      // Extend the dash pattern instead of padding with spaces
      if (/─ ─ ─/.test(trimmed)) {
        // Find position of last ─ in the dash pattern
        let lastDashIdx = -1;
        for (let j = chars.length - 2; j >= 0; j--) {
          if (chars[j] === "─") { lastDashIdx = j; break; }
        }
        if (lastDashIdx !== -1) {
          // Insert " ─" pairs after the last dash to extend the pattern
          const pairsNeeded = Math.floor(diff / 2);
          const extraSpace = diff % 2;
          const insert = [];
          for (let p = 0; p < pairsNeeded; p++) insert.push(" ", "─");
          if (extraSpace) insert.push(" ");
          chars.splice(lastDashIdx + 1, 0, ...insert);
          return chars.join("");
        }
      }

      // Default: add spaces before the closing │
      chars.splice(chars.length - 1, 0, ...Array(diff).fill(" "));
      return chars.join("");
    }

    if (currentWidth > targetWidth) {
      // Need to remove spaces before the closing │
      const diff = currentWidth - targetWidth;
      const chars = Array.from(trimmed);
      // Find spaces before the closing │ and remove them
      let removed = 0;
      for (let j = chars.length - 2; j >= 0 && removed < diff; j--) {
        if (chars[j] === " ") {
          chars.splice(j, 1);
          removed++;
        } else {
          break; // stop at first non-space
        }
      }
      return chars.join("");
    }

    return line;
  });

  return fixed.join("\n");
}

function fixBorderLine(line, targetWidth, startChar, endChar) {
  const currentWidth = visualWidth(line.trimEnd());
  if (currentWidth === targetWidth) return line;

  const trimmed = line.trimEnd();
  const chars = Array.from(trimmed);

  if (currentWidth < targetWidth) {
    // Add ─ before the end character
    const diff = targetWidth - currentWidth;
    chars.splice(chars.length - 1, 0, ...Array(diff).fill("─"));
    return chars.join("");
  }

  if (currentWidth > targetWidth) {
    // Remove ─ before the end character
    const diff = currentWidth - targetWidth;
    let removed = 0;
    for (let j = chars.length - 2; j >= 0 && removed < diff; j--) {
      if (chars[j] === "─") {
        chars.splice(j, 1);
        removed++;
      } else {
        break;
      }
    }
    return chars.join("");
  }

  return line;
}

// Process all blog files
const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
let totalFixed = 0;

for (const file of files) {
  const filePath = path.join(BLOG_DIR, file);
  const content = fs.readFileSync(filePath, "utf-8");

  // Find fenced code blocks
  const codeBlockRegex = /```\n([\s\S]*?)```/g;
  let match;
  let newContent = content;
  let fileChanged = false;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const original = match[1];
    const fixed = fixAsciiBlock(original);
    if (fixed !== original) {
      newContent = newContent.replace("```\n" + original + "```", "```\n" + fixed + "```");
      fileChanged = true;

      // Count lines that changed
      const origLines = original.split("\n");
      const fixedLines = fixed.split("\n");
      let lineChanges = 0;
      for (let i = 0; i < origLines.length; i++) {
        if (origLines[i] !== fixedLines[i]) lineChanges++;
      }
      console.log(`  ${file}: ${lineChanges} lines fixed`);
    }
  }

  if (fileChanged) {
    fs.writeFileSync(filePath, newContent, "utf-8");
    totalFixed++;
  } else {
    console.log(`  ${file}: already aligned`);
  }
}

console.log(`\nDone. Fixed ${totalFixed} of ${files.length} files.`);
