import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-6">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold">
            md2form
          </Link>
          <ThemeSwitcher />
        </header>

        <section className="flex flex-1 items-center py-16">
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">Markdown to Form Playground</p>
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight md:text-5xl">
              Build complex forms by writing Markdown.
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground">
              md2form converts structured Markdown into interactive multi-step forms.
              Open the playground to test all supported field types and properties.
            </p>
            <div className="flex items-center gap-3">
              <Button asChild>
                <Link href="/playground">Open Playground</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
