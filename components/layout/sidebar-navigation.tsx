"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { OpnameBuddyLogo } from "@/components/layout/opname-buddy-logo";
import type { NavItem } from "@/types/navigation";

interface SidebarNavigationProps {
  items: NavItem[];
  isOpen: boolean;
  onClose: () => void;
  footer?: React.ReactNode;
}

export function SidebarNavigation({
  items,
  isOpen,
  onClose,
  footer,
}: SidebarNavigationProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Sluit navigatie"
          className="fixed inset-0 z-40 bg-carbon-black-900/40 lg:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-blue-slate-800 text-white transition-transform lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="border-b border-white/10 px-5 py-5">
          <OpnameBuddyLogo variant="light" />
        </div>

        <nav className="flex-1 space-y-1 px-3 py-3" aria-label="Hoofdnavigatie">
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/care" &&
                item.href !== "/planning" &&
                item.href !== "/admin" &&
                pathname.startsWith(item.href));

            const Icon = item.icon;

            return (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="rounded-full bg-cherry-rose-600 px-2 py-0.5 text-xs font-semibold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {footer ? (
          <div className="border-t border-white/10 px-5 py-4">{footer}</div>
        ) : null}
      </aside>
    </>
  );
}
