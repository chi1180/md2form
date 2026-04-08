import Link from "next/link";
import { AuthNav } from "@/components/auth-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-6">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold">
            md2form
          </Link>
          <AuthNav />
        </header>

        <section className="flex flex-1 items-center py-16">
          <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">Markdown-first Form Builder</p>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
                Write forms in Markdown, share instantly, and analyze responses.
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground">
                md2form helps teams create public forms without UI-heavy builders.
                Draft in Markdown, publish with a link, and monitor trends from a
                private dashboard.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild>
                  <Link href="/dashboard">Open Dashboard</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/settings">Account settings</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/playground">Try Playground</Link>
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="space-y-4 p-6">
                <h2 className="text-lg font-semibold">What you get</h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Public form links with anonymous response submission</li>
                  <li>Owner-only response list with signature preview via signed URLs</li>
                  <li>Built-in analytics for trends, choice distribution, and numeric stats</li>
                </ul>
                <div className="pt-2">
                  <Button variant="secondary" asChild>
                    <Link href="/dashboard">Open Dashboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
