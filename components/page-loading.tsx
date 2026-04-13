import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageLoadingProps {
  message?: string;
  className?: string;
}

export function PageLoading({ message = "Loading...", className }: PageLoadingProps) {
  return (
    <main className={cn("min-h-screen bg-background text-foreground", className)}>
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-6 py-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground" role="status" aria-live="polite">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span>{message}</span>
        </div>
      </div>
    </main>
  );
}
