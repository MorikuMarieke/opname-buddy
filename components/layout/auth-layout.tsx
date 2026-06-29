import { OpnameBuddyLogo } from "@/components/layout/opname-buddy-logo";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-parchment-50 px-6 py-12">
      <div className="mb-8">
        <OpnameBuddyLogo />
      </div>
      <div className="w-full max-w-md rounded-2xl border border-parchment-200 bg-white p-8 shadow-card">
        {children}
      </div>
    </div>
  );
}
