"use client";

import { Suspense } from "react";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PageLoading } from "@/components/page-loading";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  return (
    <Suspense fallback={<PageLoading message="Loading sign-in..." />}>
      <SignInPageInner />
    </Suspense>
  );
}

function SignInPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const next = searchParams.get("next") || "/dashboard";

  const handlePasswordSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success("Signed in successfully.");
      router.replace(next);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sign in.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });

      if (error) {
        throw error;
      }

      toast.success("Magic link sent. Check your inbox.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send magic link.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handlePasswordSignIn}>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />

              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in with password"}
              </Button>
              <Button
                className="w-full"
                variant="secondary"
                type="button"
                disabled={loading || email.trim().length === 0}
                onClick={handleMagicLink}
              >
                Send magic link instead
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/">Back to home</Link>
              </Button>

              <p className="pt-1 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href={`/auth/sign-up?next=${encodeURIComponent(next)}`}
                  className="text-primary underline underline-offset-2"
                >
                  Sign up here
                </Link>
                .
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
