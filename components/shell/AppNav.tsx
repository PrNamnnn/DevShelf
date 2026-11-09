"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type MouseEvent } from "react";
import { FlaskIcon, MoonIcon, ProgressIcon, RouteIcon, SearchIcon, ShelfIcon, SunIcon } from "@/components/icons";
import { IntentLink } from "@/components/IntentLink";
import { technologies } from "@/lib/technologies";

const ITEMS = [
  { href: "/", label: "Library", Icon: ShelfIcon },
  { href: "/paths", label: "Career Paths", Icon: RouteIcon },
  { href: "/search", label: "Search", Icon: SearchIcon },
  { href: "/progress", label: "Progress", Icon: ProgressIcon },
];

const LABS_URL = "https://ml-visual-lab-silk.vercel.app/";

const ITEM_HEIGHT = 44;

function toggleTheme() {
  const root = document.documentElement;
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  try {
    localStorage.setItem("devshelf:theme", next);
  } catch {
    // The theme still applies for this page view.
  }
}

function toggleNav() {
  const root = document.documentElement;
  const collapsed = root.dataset.nav !== "collapsed";
  if (collapsed) root.dataset.nav = "collapsed";
  else delete root.dataset.nav;
  try {
    localStorage.setItem("devshelf:nav", collapsed ? "collapsed" : "open");
  } catch {
    // The layout still applies for this page view.
  }
}

/** The sidebar is its own toggle: any click that isn't on a control collapses or opens it. */
function onRailClick(event: MouseEvent<HTMLElement>) {
  const target = event.target as HTMLElement;
  if (target.closest("a, button")) return;
  if (target.classList.contains("rail-books") && event.nativeEvent.offsetX >= target.clientWidth) return;
  toggleNav();
}

function ThemeButton({ className = "" }: { className?: string }) {
  return (
    <button type="button" className={`icon-btn ${className}`} onClick={toggleTheme} aria-label="Switch colour theme" data-tip="Switch theme">
      <SunIcon className="theme-sun" />
      <MoonIcon className="theme-moon" />
    </button>
  );
}

export function BrandMark({ size = 26 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <rect x="5" y="5" width="6" height="22" rx="1.5" fill="var(--accent)" />
      <rect x="13" y="9" width="5" height="18" rx="1.5" fill="var(--ink)" />
      <rect x="21.2" y="6.2" width="5" height="21" rx="1.5" fill="var(--pink)" transform="rotate(10 23.7 16.7)" />
    </svg>
  );
}

export function AppNav() {
  const pathname = usePathname();
  const activeIndex = ITEMS.findIndex((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
  );
  const activeBook = pathname.split("/")[1];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === "b") {
        event.preventDefault();
        toggleNav();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <nav className="rail glass" aria-label="Main" onClick={onRailClick}>
        <button type="button" className="rail-toggle-key" onClick={toggleNav}>
          Collapse or expand sidebar (Ctrl+B)
        </button>
        <Link href="/" className="rail-brand" aria-label="DevShelf home">
          <BrandMark />
          <span className="rail-word">DevShelf</span>
        </Link>

        <ul className="rail-items">
          {activeIndex >= 0 && (
            <span className="rail-pill" aria-hidden="true" style={{ transform: `translateY(${activeIndex * ITEM_HEIGHT}px)` }} />
          )}
          {ITEMS.map(({ href, label, Icon }, index) => (
            <li key={href}>
              <Link href={href} className="rail-item" aria-current={index === activeIndex ? "page" : undefined} data-rail-tip={label}>
                <Icon />
                <span className="rail-label">{label}</span>
              </Link>
            </li>
          ))}
          <li>
            <a href={LABS_URL} target="_blank" rel="noopener noreferrer" className="rail-item" aria-label="ML Visual Labs, deep maths, opens in a new tab" data-rail-tip="ML Visual Labs">
              <FlaskIcon />
              <span className="rail-label">ML Visual Labs</span>
            </a>
          </li>
        </ul>

        <div className="rail-books">
          <p className="rail-heading">Books</p>
          <ul>
            {technologies.map((technology) => (
              <li key={technology.id}>
                <IntentLink
                  href={`/${technology.id}`}
                  className="rail-book"
                  aria-current={activeBook === technology.id ? "page" : undefined}
                  aria-label={technology.name}
                  data-rail-tip={technology.name}
                >
                  <i style={{ background: technology.spine }} />
                  <span className="rail-label">{technology.name}</span>
                </IntentLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="rail-foot">
          <ThemeButton />
        </div>
      </nav>

      <nav className="dock glass" aria-label="Main">
        {ITEMS.map(({ href, label, Icon }, index) => (
          <Link key={href} href={href} className="dock-item" aria-current={index === activeIndex ? "page" : undefined} aria-label={label}>
            <Icon width={20} height={20} />
          </Link>
        ))}
        <a href={LABS_URL} target="_blank" rel="noopener noreferrer" className="dock-item" aria-label="ML Visual Labs, opens in a new tab">
          <FlaskIcon width={20} height={20} />
        </a>
        <ThemeButton className="dock-theme" />
      </nav>
    </>
  );
}
