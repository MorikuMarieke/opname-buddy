import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ActionTileAccent = "copper" | "blue-slate" | "pearl-aqua";

interface ActionTileProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: ActionTileAccent;
  className?: string;
}

const accentClasses: Record<ActionTileAccent, string> = {
  copper: "bg-copper/15 text-copper",
  "blue-slate": "bg-blue-slate/10 text-blue-slate",
  "pearl-aqua": "bg-pearl-aqua/40 text-blue-slate",
};

export function ActionTile({
  href,
  icon: Icon,
  title,
  description,
  accent = "blue-slate",
  className,
}: ActionTileProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-h-[140px] flex-col gap-4 rounded-2xl border border-dust-grey bg-white p-6 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl",
          accentClasses[accent],
        )}
      >
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-carbon-black">{title}</h3>
        <p className="text-sm text-carbon-black/70">{description}</p>
      </div>
    </Link>
  );
}
