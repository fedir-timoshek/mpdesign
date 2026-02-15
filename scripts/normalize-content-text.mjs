import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const contentFile = path.resolve(projectRoot, "src/data/content.local.json");

const replacements = [
  // Brand name normalization (supplier uses Polish diacritics).
  { from: /Witraż/g, to: "Witraz" },
  { from: /Witaż/g, to: "Witraz" },
  { from: /witraż/g, to: "witraz" },
  { from: /witaż/g, to: "witraz" },

  // Fix wrong literal translations of the brand ("stained glass") in FR/DE.
  { from: /HS-Buntglasobjektträger/g, to: "HS Witraz Slide" },
  { from: /SKB-Buntglasfenster/g, to: "Witraz SKB" },
  { from: /Buntglas/g, to: "Witraz" },
  { from: /Glissière de vitrail HS/g, to: "HS Witraz Slide" },
  { from: /Toboggan HS Witraz/g, to: "HS Witraz Slide" },
  { from: /Vitrail/g, to: "Witraz" },
  { from: /vitrail/g, to: "Witraz" },

  // Fix a couple of machine-translation artifacts.
  { from: /\bMit HS76\b/g, to: "Witraz HS76" },
  { from: /\bMit SKB\b/g, to: "Witraz SKB" },
];

function normalizeString(value) {
  let next = String(value);
  for (const rule of replacements) {
    next = next.replace(rule.from, rule.to);
  }
  return next;
}

function walk(value) {
  if (typeof value === "string") {
    return normalizeString(value);
  }
  if (Array.isArray(value)) {
    return value.map(walk);
  }
  if (value && typeof value === "object") {
    const next = {};
    for (const [key, item] of Object.entries(value)) {
      next[key] = walk(item);
    }
    return next;
  }
  return value;
}

function main() {
  const content = JSON.parse(fs.readFileSync(contentFile, "utf8"));
  const normalized = walk(content);
  normalized.updatedAt = new Date().toISOString();

  fs.writeFileSync(contentFile, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  console.warn("Content normalized.");
}

main();

