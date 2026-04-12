import type { Medicine } from "./types";

function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function thumbSeed(m: Medicine) {
  return `${m.name || "medicine"}|${m._id || ""}`;
}

function pickTheme(seed: string) {
  const themes: Array<{ a: string; b: string; accent: string }> = [
    { a: "#5eead4", b: "#a78bfa", accent: "#0f766e" },
    { a: "#fda4af", b: "#fde047", accent: "#9f1239" },
    { a: "#7dd3fc", b: "#c4b5fd", accent: "#0369a1" },
    { a: "#86efac", b: "#6ee7b7", accent: "#166534" },
    { a: "#fcd34d", b: "#fb923c", accent: "#9a3412" },
    { a: "#f0abfc", b: "#93c5fd", accent: "#86198f" },
    { a: "#67e8f9", b: "#a5b4fc", accent: "#155e75" },
    { a: "#bbf7d0", b: "#fef08a", accent: "#3f6212" },
  ];
  return themes[hashString(seed) % themes.length];
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = (parts[0]?.[0] || "M").toUpperCase();
  const b = (parts[1]?.[0] || "").toUpperCase();
  return (a + b).slice(0, 2);
}

export function medicineImageSrc(m: Medicine) {
  const img = m.images?.[0];
  if (img && (img.startsWith("/") || /^https:\/\//i.test(img.trim()))) return img.trim();

  const seed = thumbSeed(m);
  const { a, b, accent } = pickTheme(seed);
  const label = (m.name || "Medicine").slice(0, 24);
  const sub = m.type ? m.type.toUpperCase() : "MED";
  const ini = initials(m.name || "Medicine");
  const gradId = `g${hashString(seed)}`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520">
  <defs>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${a}"/>
      <stop offset="55%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="${b}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="520" rx="28" fill="url(#${gradId})"/>
  <rect x="520" y="72" width="220" height="88" rx="44" fill="${accent}" opacity="0.12"/>
  <circle cx="110" cy="110" r="62" fill="${accent}" opacity="0.12"/>
  <rect x="48" y="70" width="140" height="140" rx="22" fill="${accent}" opacity="0.14"/>
  <text x="118" y="158" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-size="44" font-weight="800" fill="${accent}">${ini}</text>
  <text x="48" y="300" font-family="ui-sans-serif, system-ui" font-size="18" font-weight="700" fill="${accent}" opacity="0.9">${sub}</text>
  <text x="48" y="352" font-family="ui-sans-serif, system-ui" font-size="42" font-weight="900" fill="#0f172a">${escapeXml(label)}</text>
</svg>`;

  const base64 =
    typeof window !== "undefined"
      ? window.btoa(unescape(encodeURIComponent(svg)))
      : Buffer.from(svg, "utf8").toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
