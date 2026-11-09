"use client";

import Link from "next/link";
import { useState, type ComponentProps } from "react";

/** A link in a long list: its page is fetched when the reader shows intent, not whenever it is on screen. */
export function IntentLink({ onMouseEnter, onTouchStart, ...props }: ComponentProps<typeof Link>) {
  const [armed, setArmed] = useState(false);
  return (
    <Link
      {...props}
      prefetch={armed ? null : false}
      onMouseEnter={(event) => {
        setArmed(true);
        onMouseEnter?.(event);
      }}
      onTouchStart={(event) => {
        setArmed(true);
        onTouchStart?.(event);
      }}
    />
  );
}
