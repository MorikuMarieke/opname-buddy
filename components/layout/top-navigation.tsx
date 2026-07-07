"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { OpnameBuddyLogo } from "@/components/layout/opname-buddy-logo";
import { patientBottomNavItems } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";

interface TopNavigationProps {
  variant: "patient" | "professional";
  greeting?: string;
  pageTitle?: string;
  onMenuClick?: () => void;
  showSearch?: boolean;
}

export function TopNavigation({
  variant,
  greeting,
  pageTitle,
  onMenuClick,
  showSearch = true,
}: TopNavigationProps) {
  const pathname = usePathname();

  if (variant === "patient") {
    return (
      <header className="border-b border-parchment-200 bg-white px-4 py-4 sm:px-6 lg:py-5">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <OpnameBuddyLogo />
          <LogoutButton />
        </div>

        {greeting ? (
          <div className="mx-auto mt-4 max-w-4xl lg:mt-3">
            <p className="text-xl font-semibold text-carbon-black-900 sm:text-2xl lg:text-xl">
              {greeting}
            </p>
          </div>
        ) : null}

        <nav
          className="mx-auto mt-4 hidden max-w-4xl items-center gap-1 lg:flex"
          aria-label="Patiëntnavigatie"
        >
          {patientBottomNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-copper-200 text-copper-700"
                    : "text-carbon-black-600 hover:bg-parchment-100 hover:text-blue-slate-700",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>
    );
  }

  return (
    <header className="border-b border-parchment-200 bg-white px-4 py-3 sm:px-5">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-dust-grey-200 text-blue-slate-700 lg:hidden"
          aria-label="Open navigatie"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden flex-1 sm:block">
          {pageTitle ? (
            <h1 className="text-base font-semibold text-carbon-black-900">
              {pageTitle}
            </h1>
          ) : null}
        </div>

        <div className="relative hidden max-w-md flex-1 md:block">
          {showSearch ? (
            <>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-carbon-black-400"
                aria-hidden
              />
              <input
                type="search"
                disabled
                placeholder="Zoek patiënt..."
                className="h-10 w-full rounded-xl border border-parchment-200 bg-white pl-10 pr-4 text-sm text-carbon-black-900 placeholder:text-carbon-black-400"
              />
            </>
          ) : null}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-carbon-black-900">
              Sanne de Vries
            </p>
            <p className="text-xs text-carbon-black-600">Verpleegkundige</p>
          </div>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-pearl-aqua-200 text-sm font-semibold text-pearl-aqua-800"
            aria-hidden
          >
            SV
          </div>
        </div>
      </div>
    </header>
  );
}
