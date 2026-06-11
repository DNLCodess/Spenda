// Generates Spenda's PWA icons from inline SVG. Run: node scripts/generate-icons.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const EMERALD = "#0E7C5A";

// A clean white wallet on an emerald field — matches the in-app brand mark.
const wallet = (sw = 26) => `
  <g fill="none" stroke="#FFFFFF" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round">
    <rect x="138" y="172" width="236" height="168" rx="30"/>
    <path d="M138 224 H374"/>
  </g>
  <circle cx="330" cy="288" r="16" fill="#FFFFFF"/>`;

// Rounded-corner icon (Android/desktop) — corners baked in.
const standardSvg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="112" fill="${EMERALD}"/>
  ${wallet()}
</svg>`;

// Maskable — full-bleed background, glyph kept inside the ~80% safe zone.
const maskableSvg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="${EMERALD}"/>
  <g transform="translate(256 256) scale(0.72) translate(-256 -256)">${wallet(30)}</g>
</svg>`;

const dir = fileURLToPath(new URL("../public/icons/", import.meta.url));
await mkdir(dir, { recursive: true });
const out = (name) => dir + name;

const std = Buffer.from(standardSvg);
const mask = Buffer.from(maskableSvg);

await Promise.all([
  sharp(std).resize(192, 192).png().toFile(out("icon-192.png")),
  sharp(std).resize(512, 512).png().toFile(out("icon-512.png")),
  sharp(std).resize(180, 180).png().toFile(out("apple-touch-icon.png")),
  sharp(mask).resize(512, 512).png().toFile(out("maskable-512.png")),
]);

console.log("icons written to public/icons/");
