import { NextResponse } from "next/server";

import {
  classifyAdviceApiErrorStatus,
  patientSafeHttpError,
  toPatientDailyAdvice,
  toPatientSafeErrorMessage,
} from "@/lib/daily-advice/patient-response";
import {
  DAILYBUDDY_NDJSON_CONTENT_TYPE,
  encodeNdjsonLine,
  type DailyBuddyStreamEvent,
} from "@/lib/daily-advice/stream-events";
import {
  generateAdviceForCurrentPatient,
  readAdviceForCurrentPatient,
} from "@/lib/services/daily-advice-server";
import { isDailyBuddyPrerequisite } from "@/types/daily-advice-prerequisites";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
};

function wantsNdjsonStream(request: Request, body: { stream?: boolean }): boolean {
  if (body.stream === true) {
    return true;
  }
  const accept = request.headers.get("accept") ?? "";
  return accept.includes(DAILYBUDDY_NDJSON_CONTENT_TYPE);
}

function createNdjsonStreamResponse(
  run: (emit: (event: DailyBuddyStreamEvent) => void) => Promise<void>,
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (event: DailyBuddyStreamEvent) => {
        controller.enqueue(encoder.encode(encodeNdjsonLine(event)));
      };

      try {
        await run(emit);
      } catch (error) {
        console.error("[DailyBuddy] stream error:", error);
        emit({ type: "error", error: toPatientSafeErrorMessage(error) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      ...NO_STORE_HEADERS,
      "Content-Type": DAILYBUDDY_NDJSON_CONTENT_TYPE,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      forceRetry?: boolean;
      stream?: boolean;
    };

    const options = {
      forceRetry: Boolean(body.forceRetry),
    };

    if (wantsNdjsonStream(request, body)) {
      return createNdjsonStreamResponse(async (emit) => {
        const result = await generateAdviceForCurrentPatient({
          ...options,
          onProgress: (event) => emit(event),
        });

        if (result.prerequisite) {
          emit({
            type: "prerequisite",
            status: result.prerequisite,
            startedGeneration: false,
          });
          return;
        }

        emit({
          type: "result",
          advice: toPatientDailyAdvice(result.advice),
          startedGeneration: result.startedGeneration,
        });
      });
    }

    const result = await generateAdviceForCurrentPatient(options);

    if (result.prerequisite) {
      return NextResponse.json(
        {
          status: result.prerequisite,
          startedGeneration: false,
        },
        { headers: NO_STORE_HEADERS },
      );
    }

    const status =
      !result.startedGeneration && result.advice.status === "generating"
        ? "generating"
        : !result.startedGeneration && result.advice.status === "ready"
          ? "ready"
          : undefined;

    return NextResponse.json(
      {
        advice: toPatientDailyAdvice(result.advice),
        startedGeneration: result.startedGeneration,
        ...(status ? { status } : {}),
      },
      { headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    console.error("[DailyBuddy] POST error:", error);
    const status = classifyAdviceApiErrorStatus(error);

    return NextResponse.json(
      { error: patientSafeHttpError(status) },
      { status, headers: NO_STORE_HEADERS },
    );
  }
}

export async function GET() {
  try {
    const result = await readAdviceForCurrentPatient();

    return NextResponse.json(
      {
        advice: result.advice
          ? toPatientDailyAdvice(result.advice)
          : null,
        ...(result.prerequisite && isDailyBuddyPrerequisite(result.prerequisite)
          ? { prerequisite: result.prerequisite }
          : {}),
      },
      { headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    console.error("[DailyBuddy] GET error:", error);
    const status = classifyAdviceApiErrorStatus(error);

    return NextResponse.json(
      { error: patientSafeHttpError(status) },
      { status, headers: NO_STORE_HEADERS },
    );
  }
}
