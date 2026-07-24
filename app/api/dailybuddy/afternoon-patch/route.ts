import { NextResponse } from "next/server";

import { patchAfternoonAdviceForToday } from "@/lib/services/daily-advice-server";

export async function POST() {
  try {
    const result = await patchAfternoonAdviceForToday();
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Bijwerken mislukt.";
    const status =
      message.includes("Niet ingelogd") || message.includes("Geen toegang")
        ? 401
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
