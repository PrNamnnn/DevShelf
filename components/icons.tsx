import type { ReactNode, SVGProps } from "react";

function Icon({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

type P = SVGProps<SVGSVGElement>;

export const ShelfIcon = (p: P) => <Icon {...p}><path d="M5 4v14M9 4v14M14.2 4.6l3.9 13" /><path d="M3 21h18" /></Icon>;
export const SearchIcon = (p: P) => <Icon {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.3-4.3" /></Icon>;
export const ProgressIcon = (p: P) => <Icon {...p}><path d="M12 3a9 9 0 1 0 9 9" /><path d="M12 3a9 9 0 0 1 9 9h-9z" /></Icon>;
export const RouteIcon = (p: P) => <Icon {...p}><circle cx="6" cy="19" r="2.5" /><circle cx="18" cy="5" r="2.5" /><path d="M8.5 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5" /></Icon>;
export const FlaskIcon = (p: P) => <Icon {...p}><path d="M9.5 3.5h5M10.5 3.5v6L5 19a1.3 1.3 0 0 0 1.1 2h11.8a1.3 1.3 0 0 0 1.1-2l-5.5-9.5v-6" /><path d="M7.8 15h8.4" /></Icon>;
export const SunIcon = (p: P) => <Icon {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></Icon>;
export const MoonIcon = (p: P) => <Icon {...p}><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" /></Icon>;
export const ArrowLeftIcon = (p: P) => <Icon {...p}><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></Icon>;
export const ArrowRightIcon = (p: P) => <Icon {...p}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></Icon>;
export const ChevronIcon = (p: P) => <Icon {...p}><path d="m6 9 6 6 6-6" /></Icon>;
export const CheckIcon = (p: P) => <Icon {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Icon>;
export const BookmarkIcon = (p: P) => <Icon {...p}><path d="M7 3.5h10a1 1 0 0 1 1 1V21l-6-3.8L6 21V4.5a1 1 0 0 1 1-1z" /></Icon>;
export const ClockIcon = (p: P) => <Icon {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 1.8" /></Icon>;
export const ExpandIcon = (p: P) => <Icon {...p}><path d="m7 9 5-5 5 5M7 15l5 5 5-5" /></Icon>;
export const CollapseIcon = (p: P) => <Icon {...p}><path d="m7 5 5 5 5-5M7 19l5-5 5 5" /></Icon>;
export const LinkIcon = (p: P) => <Icon {...p}><path d="M8 16 16 8" /><path d="M10 7h7v7" /></Icon>;
export const InfoIcon = (p: P) => <Icon {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 8h.01" /></Icon>;
export const AlertIcon = (p: P) => <Icon {...p}><path d="M12 4 2.8 19.5h18.4z" /><path d="M12 10v4.5M12 17h.01" /></Icon>;
export const ArchiveIcon = (p: P) => <Icon {...p}><rect x="3.5" y="4.5" width="17" height="4.5" rx="1" /><path d="M5 9v10.5h14V9M10 13h4" /></Icon>;
export const TagIcon = (p: P) => <Icon {...p}><path d="M3.5 12V4.5H11l9.5 9.5-7 7z" /><path d="M8 8.5h.01" /></Icon>;
export const QuestionIcon = (p: P) => <Icon {...p}><circle cx="12" cy="12" r="8.5" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.1.9-1.1 1.8M12 16.5h.01" /></Icon>;
