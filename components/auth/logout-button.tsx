"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { SecondaryButton } from "@/components/ui/secondary-button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

interface LogoutButtonProps {
  variant?: "text" | "icon" | "sidebar";
  initials?: string;
  className?: string;
}

export function LogoutButton({
  variant = "text",
  initials = "?",
  className,
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);

    const supabase = createClient();
    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoading}
        aria-label={isLoading ? "Bezig met uitloggen" : "Uitloggen"}
        className={cn(
          "inline-flex h-10 items-center gap-1.5 rounded-xl border border-dust-grey-200 bg-white pl-1 pr-2.5 text-carbon-black-700 transition-colors hover:bg-dust-grey-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pearl-aqua-600 disabled:opacity-50",
          className,
        )}
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-pearl-aqua-200 text-xs font-semibold text-pearl-aqua-800"
          aria-hidden
        >
          {initials}
        </span>
        <LogOut className="h-4 w-4 shrink-0" aria-hidden />
      </button>
    );
  }

  if (variant === "sidebar") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoading}
        className={cn(
          "flex min-h-10 w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50",
          className,
        )}
      >
        <LogOut className="h-5 w-5 shrink-0" aria-hidden />
        <span>{isLoading ? "Bezig..." : "Uitloggen"}</span>
      </button>
    );
  }

  return (
    <SecondaryButton
      size="sm"
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? "Bezig..." : "Uitloggen"}
    </SecondaryButton>
  );
}
