import { NextResponse } from "next/server";
import { IntentNotFoundError, InvalidTransitionError, ChainNotSupportedError } from "@/lib/errors";

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof IntentNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  if (error instanceof InvalidTransitionError) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }
  if (error instanceof ChainNotSupportedError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (error instanceof Error && error.name === "ZodError") {
    return NextResponse.json({ error: "Invalid input", details: error }, { status: 400 });
  }
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
