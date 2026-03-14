import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getIntentById } from "@/lib/repositories/payment-intents";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ intentId: string }> }
) {
  try {
    const { intentId } = await params;
    const supabase = createSupabaseServiceClient();
    const intent = await getIntentById(supabase, intentId);

    if (!intent) {
      return NextResponse.json({ error: "Intent not found" }, { status: 404 });
    }

    return NextResponse.json(intent);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
