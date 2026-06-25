"use client";

import { Menu, Search } from "lucide-react";
import { OpnameBuddyLogo } from "@/components/layout/opname-buddy-logo";
import { SecondaryButton } from "@/components/ui/secondary-button";

interface TopNavigationProps {
  variant: "patient" | "professional";
  greeting?: string;
  pageTitle?: string;
  onMenuClick?: () => void;
}

export function TopNavigation({
  variant,
  greeting,
  pageTitle,
  onMenuClick,
}: TopNavigationProps) {
  if (variant === "patient") {
    return (
      <header className="border-b border-dust-grey bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <OpnameBuddyLogo />
          <SecondaryButton href="/login" size="sm">
            Uitloggen
          </SecondaryButton>
        </div>
        {greeting ? (
          <div className="mx-auto mt-4 max-w-6xl">
            <p className="text-xl font-semibold text-carbon-black sm:text-2xl">
              {greeting}
            </p>
          </div>
        ) : null}
      </header>
    );
  }

  return (
    <header className="border-b border-dust-grey bg-white px-4 py-4 sm:px-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-dust-grey text-blue-slate lg:hidden"
          aria-label="Open navigatie"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden flex-1 sm:block">
          {pageTitle ? (
            <h1 className="text-lg font-semibold text-carbon-black">{pageTitle}</h1>
          ) : null}
        </div>

        <div className="relative hidden flex-1 max-w-md md:block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-carbon-black/40"
            aria-hidden
          />
          <input
            type="search"
            disabled
            placeholder="Zoek patiënt..."
            className="h-11 w-full rounded-xl border border-dust-grey bg-parchment pl-10 pr-4 text-sm text-carbon-black placeholder:text-carbon-black/40"
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-carbon-black">Sanne de Vries</p>
            <p className="text-xs text-carbon-black/60">Verpleegkundige</p>
          </div>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-pearl-aqua/50 text-sm font-semibold text-blue-slate"
            aria-hidden
          >
            SV
          </div>
        </div>
      </div>
    </header>
  );
}
