import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeftIcon } from "@/components/icons";

export function BackButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="icon-btn" aria-label={label} data-tip={label}>
      <ArrowLeftIcon />
    </Link>
  );
}

export function ProgressRing({
  percent,
  size = 56,
  stroke = 4,
  children,
}: {
  percent: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <span className="pring" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} className="ring-track" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className="ring-value"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
        />
      </svg>
      {children && <span className="ring-label">{children}</span>}
    </span>
  );
}

export function ProgressBar({ percent, label }: { percent: number; label: string }) {
  return (
    <span className="bar" role="progressbar" aria-label={label} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ transform: `scaleX(${percent / 100})` }} />
    </span>
  );
}

export function LevelDots({ level }: { level: "fundamental" | "intermediate" | "advanced" }) {
  const filled = level === "fundamental" ? 1 : level === "intermediate" ? 2 : 3;
  return (
    <span className="level" data-tip={level} aria-label={`Difficulty: ${level}`}>
      {[1, 2, 3].map((dot) => (
        <i key={dot} data-on={dot <= filled} />
      ))}
    </span>
  );
}

export function EmptyIllustration() {
  return (
    <svg viewBox="0 0 220 110" width="200" aria-hidden="true" className="empty-art">
      <path d="M12 96h196" strokeWidth="2" />
      <rect x="62" y="40" width="20" height="56" rx="2" />
      <rect x="85" y="30" width="16" height="66" rx="2" />
      <rect x="128" y="46" width="18" height="52" rx="2" transform="rotate(-18 128 96)" />
      <path d="M67 52h10M89 44h8" />
    </svg>
  );
}

export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="empty">
      <EmptyIllustration />
      <p className="empty-title">{title}</p>
      <div className="empty-body">{children}</div>
    </div>
  );
}
