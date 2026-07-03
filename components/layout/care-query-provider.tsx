"use client";

import { QueryProvider } from "@/providers/query-provider";

interface CareQueryProviderProps {
  children: React.ReactNode;
}

export function CareQueryProvider({ children }: CareQueryProviderProps) {
  return <QueryProvider>{children}</QueryProvider>;
}
