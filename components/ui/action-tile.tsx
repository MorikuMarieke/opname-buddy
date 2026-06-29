import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ActionTileAccent = "copper" | "blue-slate" | "pearl-aqua";
type ActionTileSize = "default" | "kiosk";

interface ActionTileProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: ActionTileAccent;
  size?: ActionTileSize;
  className?: string;
}

const accentClasses: Record<ActionTileAccent, string> = {
  copper: "bg-copper-50 text-copper-600",
  "blue-slate": "bg-blue-slate-50 text-blue-slate-700",
  "pearl-aqua": "bg-pearl-aqua-50 text-blue-slate-700",
};

const tileSizeClasses: Record<ActionTileSize, string> = {
  default: "min-h-[140px] gap-4 rounded-2xl p-6",
  kiosk: "min-h-[180px] gap-6 rounded-3xl p-8",
};

const iconWrapSizeClasses: Record<ActionTileSize, string> = {
  default: "h-12 w-12",
  kiosk: "h-16 w-16",
};

const iconSizeClasses: Record<ActionTileSize, string> = {
  default: "h-6 w-6",
  kiosk: "h-8 w-8",
};

const titleSizeClasses: Record<ActionTileSize, string> = {
  default: "text-lg",
  kiosk: "text-xl",
};

const descriptionSizeClasses: Record<ActionTileSize, string> = {
  default: "text-sm",
  kiosk: "text-base",
};

export function ActionTile({
  href,
  icon: Icon,
  title,
  description,
  accent = "blue-slate",
  size = "kiosk",
  className,
}: ActionTileProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col border border-dust-grey-200 bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper-600 focus-visible:ring-offset-2",
        tileSizeClasses[size],
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-xl",
          iconWrapSizeClasses[size],
          accentClasses[accent],
        )}
      >
        <Icon className={iconSizeClasses[size]} aria-hidden />
      </div>
      <div className="space-y-1">
        <h3
          className={cn("font-semibold text-carbon-black-900", titleSizeClasses[size])}
        >
          {title}
        </h3>
        <p className={cn("text-carbon-black-600", descriptionSizeClasses[size])}>
          {description}
        </p>
      </div>
    </Link>
  );
}
