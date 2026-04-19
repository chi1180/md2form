"use client";

import { Suspense } from "react";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PageLoading } from "@/components/page-loading";
import { LegalLinks } from "@/components/legal-links";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  return (
    <Suspense fallback={<PageLoading message="Loading sign-up..." />}>
      <SignUpPageInner />
    </Suspense>
  );
}

function SignUpPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToLegal, setAgreedToLegal] = useState(false);
  const [loading, setLoading] = useState(false);

  const next = searchParams.get("next") || "/dashboard";

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!agreedToLegal) {
      toast.warning("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo },
      });

      if (error) {
        const message = error.message.toLowerCase();
        if (
          message.includes("already") ||
          message.includes("registered") ||
          message.includes("exists")
        ) {
          toast.warning("This account already exists. Please sign in instead.");
          router.replace(`/auth/sign-in?next=${encodeURIComponent(next)}`);
          return;
        }
        throw error;
      }

      if (
        Array.isArray(data.user?.identities) &&
        data.user.identities.length === 0
      ) {
        toast.warning("This account already exists. Please sign in instead.");
        router.replace(`/auth/sign-in?next=${encodeURIComponent(next)}`);
        return;
      }

      toast.success(
        "Account created. Check your inbox if confirmation is required.",
      );
      router.replace(`/auth/sign-in?next=${encodeURIComponent(next)}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sign up.";
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
            <CardTitle>Sign up</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSignUp}>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <Input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 8 characters)"
              />

              <div className="flex items-start gap-2 rounded-md border p-3">
                <Checkbox
                  id="agree-to-legal"
                  checked={agreedToLegal}
                  onCheckedChange={(checked) =>
                    setAgreedToLegal(checked === true)
                  }
                  disabled={loading}
                />
                <Label
                  htmlFor="agree-to-legal"
                  className="text-xs leading-5 text-muted-foreground"
                >
                  I agree to&nbsp;
                  <Link
                    href="/service/terms-of-service"
                    className="text-primary hover:underline underline-offset-2"
                  >
                    Terms of Service
                  </Link>
                  &nbsp;&&nbsp;
                  <Link
                    href="/service/privacy-policy"
                    className="text-primary hover:underline underline-offset-2"
                  >
                    Privacy Policy
                  </Link>
                  .
                </Label>
              </div>

              <Button
                className="w-full"
                type="submit"
                disabled={loading || !agreedToLegal}
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>

              <Button className="w-full" variant="outline" asChild>
                <Link href="/">Back to home</Link>
              </Button>

              <p className="pt-1 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href={`/auth/sign-in?next=${encodeURIComponent(next)}`}
                  className="text-primary underline underline-offset-2"
                >
                  Sign in here
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
