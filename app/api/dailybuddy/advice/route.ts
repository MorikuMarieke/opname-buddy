import { NextResponse } from "next/server";

import { generateAdviceForCurrentPatient } from "@/lib/services/daily-advice-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      forceRetry?: boolean;
    };

    const result = await generateAdviceForCurrentPatient({
      forceRetry: Boolean(body.forceRetry),
    });

    return NextResponse.json({
      advice: result.advice,
      startedGeneration: result.startedGeneration,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Genereren mislukt.";
    const status = message.includes("check-in")
      ? 400
      : message.includes("Niet ingelogd") || message.includes("Alleen")
        ? 401
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET() {
  try {
    const { readAdviceForCurrentPatient } = await import(
      "@/lib/services/daily-advice-server"
    );
    const advice = await readAdviceForCurrentPatient();
    return NextResponse.json({ advice });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Laden mislukt.";
    const status =
      message.includes("Niet ingelogd") || message.includes("Alleen")
        ? 401
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
