/**
 * Development-only tooling gates.
 * Matches existing project convention: `process.env.NODE_ENV === "development"`.
 * Also refuses Vercel production deployments even if NODE_ENV were mis-set.
 */
export function isDailyBuddyDevToolsEnabled(): boolean {
  if (process.env.NODE_ENV !== "development") {
    return false;
  }

  if (process.env.VERCEL_ENV === "production") {
    return false;
  }

  return true;
}

export function assertDailyBuddyDevIterateAllowed(): void {
  if (!isDailyBuddyDevToolsEnabled()) {
    throw new Error(
      "Dev-iteratie is alleen beschikbaar in een lokale development-omgeving.",
    );
  }
}
