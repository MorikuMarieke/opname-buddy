import { NextResponse } from "next/server";

import {
  expressAfternoonInterest,
  readOwnAfternoonInterest,
  withdrawAfternoonInterest,
} from "@/lib/services/afternoon-interest-server";

export async function GET() {
  try {
    const interest = await readOwnAfternoonInterest();
    return NextResponse.json({ interest });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Interesse laden mislukt.";
    const status =
      message.includes("Niet ingelogd") || message.includes("Alleen patiënten")
        ? 401
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { action?: string };
    const action = body.action;

    if (action === "express") {
      const interest = await expressAfternoonInterest();
      return NextResponse.json({ interest });
    }

    if (action === "withdraw") {
      const interest = await withdrawAfternoonInterest();
      return NextResponse.json({ interest });
    }

    return NextResponse.json(
      { error: "Ongeldige actie. Gebruik express of withdraw." },
      { status: 400 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Interesse bijwerken mislukt.";
    const status =
      message.includes("Niet ingelogd") || message.includes("Alleen patiënten")
        ? 401
        : message.includes("niet mogelijk")
          ? 403
          : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
