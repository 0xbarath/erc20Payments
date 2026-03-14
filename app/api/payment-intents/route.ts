import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { createPaymentIntent } from "@/lib/services/payment-service";
import { getIntentsByVendor } from "@/lib/repositories/payment-intents";
import { createIntentInputSchema } from "@/lib/validation/schemas";
import { handleApiError } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createIntentInputSchema.parse(body);
    const supabase = createSupabaseServiceClient();
    const intent = await createPaymentIntent(supabase, input);
    return NextResponse.json(intent, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorSlug = searchParams.get("vendorSlug");

    if (!vendorSlug) {
      return NextResponse.json({ error: "vendorSlug parameter required" }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const intents = await getIntentsByVendor(supabase, vendorSlug);
    return NextResponse.json(intents);
  } catch (error) {
    return handleApiError(error);
  }
}
