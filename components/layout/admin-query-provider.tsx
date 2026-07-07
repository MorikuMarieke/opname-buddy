"use client";

import { QueryProvider } from "@/providers/query-provider";

interface AdminQueryProviderProps {
  children: React.ReactNode;
}

export function AdminQueryProvider({ children }: AdminQueryProviderProps) {
  return <QueryProvider>{children}</QueryProvider>;
}
