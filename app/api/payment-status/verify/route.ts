import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { verifyOnChain } from "@/lib/services/payment-service";
import { verifyPaymentSchema } from "@/lib/validation/schemas";
import { handleApiError } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { intentId } = verifyPaymentSchema.parse(body);
    const supabase = createSupabaseServiceClient();
    const intent = await verifyOnChain(supabase, intentId);
    return NextResponse.json(intent);
  } catch (error) {
    return handleApiError(error);
  }
}
