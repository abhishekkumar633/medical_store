import { useEffect, useId, useState } from "react";
import type { Medicine } from "../lib/types";

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

function firstImageUrl(m: Medicine): string | null {
  const raw = m.images?.[0];
  if (!raw || typeof raw !== "string") return null;
  const s = raw.trim();
  if (s.startsWith("/")) return s;
  if (/^https:\/\//i.test(s)) return s;
  return null;
}

export default function MedicineThumb({
  m,
  className,
}: {
  m: Medicine;
  className?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const gid = useId().replace(/:/g, "");
  const gradMain = `mt-g1-${gid}`;
  const gradCap = `mt-g2-${gid}`;

  const remoteSrc = firstImageUrl(m);
  useEffect(() => {
    setImgFailed(false);
  }, [remoteSrc]);
  const showPhoto = Boolean(remoteSrc && !imgFailed);

  if (showPhoto && remoteSrc) {
    return (
      <div className={`relative overflow-hidden bg-slate-100 ${className ?? ""}`}>
        <img
          src={remoteSrc}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full object-cover"
          onError={() => setImgFailed(true)}
        />
        <span className="sr-only">{m.name}</span>
      </div>
    );
  }

  const seed = thumbSeed(m);
  const { a, b, accent } = pickTheme(seed);
  const label = (m.name || "Medicine").slice(0, 24);
  const sub = m.type ? m.type.toUpperCase() : "MED";
  const ini = initials(m.name || "Medicine");

  return (
    <svg
      viewBox="0 0 800 520"
      role="img"
      aria-label={m.name}
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={gradMain} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={a} />
          <stop offset="55%" stopColor="#ffffff" />
          <stop offset="100%" stopColor={b} />
        </linearGradient>
        <linearGradient id={gradCap} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <rect width="800" height="520" rx="28" fill={`url(#${gradMain})`} />
      <rect x="520" y="72" width="220" height="88" rx="44" fill={`url(#${gradCap})`} />
      <rect x="540" y="92" width="180" height="48" rx="24" fill={accent} opacity="0.15" />
      <circle cx="640" cy="116" r="8" fill={accent} opacity="0.45" />
      <circle cx="110" cy="110" r="62" fill={accent} opacity="0.12" />
      <rect x="48" y="70" width="140" height="140" rx="22" fill={accent} opacity="0.14" />
      <text
        x="118"
        y="158"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="44"
        fontWeight="800"
        fill={accent}
      >
        {ini}
      </text>

      <text
        x="48"
        y="300"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="18"
        fontWeight="700"
        fill={accent}
        opacity="0.9"
      >
        {sub}
      </text>
      <text x="48" y="352" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="42" fontWeight="900" fill="#0f172a">
        {label}
      </text>
      <text
        x="48"
        y="398"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="20"
        fontWeight="600"
        fill="#334155"
      >
        {remoteSrc && imgFailed ? "Image unavailable • Placeholder" : "Same day dispatch"}
      </text>
    </svg>
  );
}
