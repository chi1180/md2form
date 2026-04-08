import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FormsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
        <h1 className="text-xl font-semibold">Forms</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
