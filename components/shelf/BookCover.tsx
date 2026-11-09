import type { ReactNode } from "react";
import type { Technology } from "@/lib/technologies";

/** One original foil motif per book, drawn on a 100 by 100 grid. */
const MOTIFS: Record<string, ReactNode> = {
  python: (
    <>
      <path d="M50 12c-18 0-26 8-26 20s8 18 26 18 26 7 26 18-8 20-26 20" />
      <path d="M50 22c-11 0-17 4-17 10s6 9 17 9 17 4 17 18-6 19-17 19" opacity=".5" />
      <circle cx="50" cy="12" r="3.5" fill="currentColor" />
      <circle cx="50" cy="88" r="3.5" fill="currentColor" />
    </>
  ),
  javascript: (
    <>
      <path d="M36 14c-10 0-10 8-10 16s0 15-10 20c10 5 10 12 10 20s0 16 10 16" />
      <path d="M64 14c10 0 10 8 10 16s0 15 10 20c-10 5-10 12-10 20s0 16-10 16" />
      <circle cx="50" cy="50" r="11" opacity=".55" />
      <circle cx="50" cy="39" r="3" fill="currentColor" />
    </>
  ),
  react: (
    <>
      <path d="M50 22v14M50 36 26 58M50 36l24 22M26 66v12M26 78 14 90M26 78l12 12M74 66v22" opacity=".65" />
      <circle cx="50" cy="16" r="6.5" />
      <circle cx="50" cy="36" r="4" fill="currentColor" />
      <circle cx="26" cy="62" r="5" />
      <circle cx="74" cy="62" r="5" />
      <circle cx="14" cy="92" r="3.5" />
      <circle cx="38" cy="92" r="3.5" fill="currentColor" />
      <circle cx="74" cy="92" r="3.5" />
    </>
  ),
  vue: (
    <>
      <path d="M12 18 50 84l38-66" />
      <path d="M28 18 50 56l22-38" opacity=".65" />
      <path d="M40 18l10 17 10-17" opacity=".4" />
    </>
  ),
  nextjs: (
    <>
      <rect x="16" y="52" width="68" height="34" rx="2" opacity=".35" />
      <rect x="22" y="36" width="56" height="34" rx="2" opacity=".6" />
      <rect x="28" y="20" width="44" height="34" rx="2" />
      <path d="M40 37h18M52 31l6 6-6 6" />
    </>
  ),
  tailwind: (
    <>
      <path d="M8 34c14-16 28-16 42 0s28 16 42 0" />
      <path d="M8 52c14-16 28-16 42 0s28 16 42 0" opacity=".65" />
      <path d="M8 70c14-16 28-16 42 0s28 16 42 0" opacity=".38" />
    </>
  ),
  express: (
    <>
      <path d="M50 8v84" opacity=".5" />
      <rect x="30" y="14" width="40" height="13" rx="2" />
      <rect x="30" y="36" width="40" height="13" rx="2" />
      <rect x="30" y="58" width="40" height="13" rx="2" />
      <circle cx="50" cy="85" r="6" fill="currentColor" />
    </>
  ),
  langchain: (
    <>
      <rect x="10" y="39" width="42" height="22" rx="11" />
      <rect x="48" y="39" width="42" height="22" rx="11" />
      <rect x="29" y="14" width="42" height="18" rx="9" opacity=".45" />
      <rect x="29" y="68" width="42" height="18" rx="9" opacity=".45" />
    </>
  ),
  postgresql: (
    <>
      <ellipse cx="50" cy="20" rx="32" ry="10" />
      <path d="M18 20v60c0 5.5 14.3 10 32 10s32-4.500 32-10V20" />
      <path d="M18 40c0 5.500 14.300 10 32 10s32-4.500 32-10M18 60c0 5.500 14.300 10 32 10s32-4.500 32-10" opacity=".55" />
    </>
  ),
  mongodb: (
    <>
      <path d="M38 12c-9 0-9 6-9 12s0 12-9 14c9 2 9 8 9 14s0 12 9 12" />
      <path d="M62 12c9 0 9 6 9 12s0 12 9 14c-9 2-9 8-9 14s0 12 9 12" opacity=".55" transform="translate(-9 24)" />
      <path d="M44 28h16M44 38h12M44 48h16" opacity=".7" />
    </>
  ),
  statistics: (
    <>
      <path d="M6 82h88" opacity=".5" />
      <path d="M8 82c14 0 18-3 25-22s11-44 17-44 10 25 17 44 11 22 25 22" />
      <path d="M50 16v66M33 60v22M67 60v22" opacity=".45" />
      <circle cx="50" cy="16" r="3" fill="currentColor" />
    </>
  ),
  excel: (
    <>
      <rect x="14" y="16" width="72" height="68" rx="2" />
      <path d="M14 34h72M14 52h72M14 69h72M34 16v68M60 16v68" opacity=".5" />
      <path d="M72 42H46l14 8-14 9h26" transform="translate(-9 2)" />
    </>
  ),
  powerbi: (
    <>
      <path d="M10 88h80" opacity=".5" />
      <rect x="18" y="58" width="14" height="30" rx="2" opacity=".5" />
      <rect x="43" y="36" width="14" height="52" rx="2" opacity=".75" />
      <rect x="68" y="14" width="14" height="74" rx="2" />
    </>
  ),
  "machine-learning": (
    <>
      <path d="M12 88C30 62 52 58 88 14" />
      <circle cx="24" cy="32" r="3.500" fill="currentColor" />
      <circle cx="38" cy="22" r="3.500" fill="currentColor" />
      <circle cx="30" cy="48" r="3.500" fill="currentColor" />
      <circle cx="56" cy="30" r="3.500" fill="currentColor" />
      <circle cx="58" cy="74" r="3.500" />
      <circle cx="74" cy="58" r="3.500" />
      <circle cx="80" cy="78" r="3.500" />
      <circle cx="44" cy="84" r="3.500" />
    </>
  ),
  "deep-learning": (
    <>
      <path d="M18 30 50 16M18 30 50 50M18 30 50 84M18 70 50 16M18 70 50 50M18 70 50 84M50 16 82 50M50 50 82 50M50 84 82 50" opacity=".5" />
      <circle cx="18" cy="30" r="6" />
      <circle cx="18" cy="70" r="6" />
      <circle cx="50" cy="16" r="6" />
      <circle cx="50" cy="50" r="6" fill="currentColor" />
      <circle cx="50" cy="84" r="6" />
      <circle cx="82" cy="50" r="6" />
    </>
  ),
  mlops: (
    <>
      <path d="M50 16a34 34 0 1 1-30 18" />
      <path d="m12 22 8 12 12-7" />
      <rect x="38" y="38" width="24" height="24" rx="3" opacity=".7" />
      <path d="M44 50h12M50 44v12" opacity=".7" />
    </>
  ),
  "data-engineering": (
    <>
      <path d="M22 30h20c8 0 8 40 16 40h20M42 30c8 0 8 20 16 20h20" opacity=".6" />
      <circle cx="16" cy="30" r="6.500" />
      <rect x="78" y="44" width="12" height="12" rx="2" />
      <rect x="78" y="64" width="12" height="12" rx="2" fill="currentColor" />
    </>
  ),
  sqlserver: (
    <>
      <rect x="14" y="16" width="72" height="68" rx="3" />
      <path d="M14 32h72M14 50h72M14 67h72M38 16v68M62 16v68" opacity=".55" />
      <rect x="38" y="32" width="24" height="18" fill="currentColor" opacity=".8" />
    </>
  ),
};

export function CoverArt({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 100 100" className="cover-art" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      {MOTIFS[id]}
    </svg>
  );
}

export function coverStyle(technology: Technology) {
  return {
    "--cover": technology.spine,
    "--cover-deep": technology.deep,
    "--foil": technology.foil,
  } as React.CSSProperties;
}

export function BookCover({ technology }: { technology: Technology }) {
  return (
    <div className="cover">
      <span className="cover-series">Vol. {String(technology.volume).padStart(2, "0")}</span>
      <CoverArt id={technology.id} />
      <span className="cover-title">{technology.name}</span>
    </div>
  );
}

/** The physical book: front cover, spine, page block and back board. */
export function Book3D({ technology }: { technology: Technology }) {
  return (
    <span className="book" style={coverStyle(technology)}>
      <span className="book-body">
        <span className="book-face book-back" />
        <span className="book-face book-pages" />
        <span className="book-face book-top" />
        <span className="book-face book-spine">
          <span className="spine-title">{technology.name}</span>
        </span>
        <span className="book-face book-front">
          <BookCover technology={technology} />
        </span>
      </span>
    </span>
  );
}
