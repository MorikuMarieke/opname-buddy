interface DashboardLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function DashboardLayout({ title, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-full bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-5">
        <h1 className="text-2xl font-semibold text-zinc-900">{title}</h1>
      </header>
      <main className="p-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          {children}
        </div>
      </main>
    </div>
  );
}
