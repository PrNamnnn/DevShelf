import Link from "next/link";
import { EmptyState } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="page-narrow">
      <EmptyState title="This page isn't on the shelf">
        <p>It may have moved, or it never existed.</p>
        <Link href="/" className="btn">
          Return to the library
        </Link>
      </EmptyState>
    </div>
  );
}
