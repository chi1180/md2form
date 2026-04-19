import Link from "next/link";
import { cn } from "@/lib/utils";

interface LegalLinksProps {
  className?: string;
  show: "terms-of-service" | "privacy-policy" | "all";
}

export function LegalLinks({ className, show }: LegalLinksProps) {
  return (
    <nav
      aria-label="Legal links"
      className={cn(
        "flex flex-wrap items-center gap-2 text-xs text-muted-foreground",
        className,
      )}
    >
      {(show === "privacy-policy" || show === "all") && (
        <Link
          href="/service/terms-of-service"
          className="underline-offset-2 hover:underline"
        >
          Terms of Service
        </Link>
      )}
      {show === "all" && <span className="mx-1">・</span>}
      {(show === "terms-of-service" || show === "all") && (
        <Link
          href="/service/privacy-policy"
          className="underline-offset-2 hover:underline"
        >
          Privacy Policy
        </Link>
      )}
    </nav>
  );
}
