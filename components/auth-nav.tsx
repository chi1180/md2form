"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

interface AuthNavProps {
  showDashboard?: boolean;
  showSettings?: boolean;
}

export function AuthNav({ showDashboard = true, showSettings = true }: AuthNavProps) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) {
        return;
      }

      setAuthenticated(Boolean(user));
    }

    load().catch(() => {
      if (!active) {
        return;
      }
      setAuthenticated(false);
    });

    return () => {
      active = false;
    };
  }, []);

  if (authenticated === null) {
    return <ThemeSwitcher />;
  }

  return (
    <div className="flex items-center gap-2">
      {authenticated ? (
        <>
          {showDashboard && (
            <Button variant="outline" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          )}
          {showSettings && (
            <Button variant="outline" asChild>
              <Link href="/settings">Settings</Link>
            </Button>
          )}
          <form action="/auth/sign-out" method="post">
            <Button variant="ghost" type="submit">
              Sign out
            </Button>
          </form>
        </>
      ) : (
        <Button variant="outline" asChild>
          <Link href="/auth/sign-in">Sign in</Link>
        </Button>
      )}
      <ThemeSwitcher />
    </div>
  );
}
