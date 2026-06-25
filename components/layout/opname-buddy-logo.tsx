import { Heart } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface OpnameBuddyLogoProps {
  variant?: "light" | "dark";
  className?: string;
}

export function OpnameBuddyLogo({
  variant = "dark",
  className,
}: OpnameBuddyLogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2 font-semibold",
        variant === "light" ? "text-white" : "text-carbon-black",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl",
          variant === "light" ? "bg-white/15" : "bg-pearl-aqua/50 text-blue-slate",
        )}
      >
        <Heart className="h-5 w-5" aria-hidden />
      </span>
      <span className="text-lg">OpnameBuddy</span>
    </Link>
  );
}
