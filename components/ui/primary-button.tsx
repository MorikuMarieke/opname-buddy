import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type ButtonSize = "sm" | "md" | "lg";

interface PrimaryButtonBaseProps {
  children: React.ReactNode;
  size?: ButtonSize;
  className?: string;
  icon?: React.ReactNode;
}

interface PrimaryButtonAsLink extends PrimaryButtonBaseProps {
  href: string;
  onClick?: never;
  type?: never;
  disabled?: never;
}

interface PrimaryButtonAsButton extends PrimaryButtonBaseProps {
  href?: never;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}

export type PrimaryButtonProps = PrimaryButtonAsLink | PrimaryButtonAsButton;

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-11 px-5 text-base",
  lg: "min-h-12 px-6 text-base",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-copper-600 font-medium text-white transition-colors hover:bg-copper-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

export function PrimaryButton(props: PrimaryButtonProps) {
  const { children, size = "md", className, icon } = props;
  const classes = cn(baseClasses, sizeClasses[size], className);

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={props.disabled}
      className={classes}
    >
      {icon}
      {children}
    </button>
  );
}
