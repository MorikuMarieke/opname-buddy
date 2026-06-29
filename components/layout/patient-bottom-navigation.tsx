"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { patientBottomNavItems } from "@/lib/constants/navigation";

export function PatientBottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-dust-grey-200 bg-white px-2 py-2 lg:hidden"
      aria-label="Patiëntnavigatie"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between">
        {patientBottomNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-copper-600"
                    : "text-carbon-black-600 hover:text-blue-slate-700",
                )}
              >
                <Icon className="h-6 w-6" aria-hidden />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
