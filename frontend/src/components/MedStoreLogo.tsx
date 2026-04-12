import { useId } from "react";

type Props = { className?: string; size?: number };

export default function MedStoreLogo({ className = "", size = 40 }: Props) {
  const uid = useId().replace(/:/g, "");
  const ga = `msl-ga-${uid}`;
  const gb = `msl-gb-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={ga} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id={gb} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill={`url(#${ga})`} />
      <path
        d="M24 13v22M13 24h22"
        stroke="white"
        strokeWidth="2.75"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />
      <ellipse cx="34" cy="14" rx="6" ry="3.5" fill={`url(#${gb})`} opacity="0.9" transform="rotate(-35 34 14)" />
    </svg>
  );
}
