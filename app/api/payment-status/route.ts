import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { transitionPaymentStatus } from "@/lib/services/payment-service";
import { paymentStatusUpdateSchema } from "@/lib/validation/schemas";
import { handleApiError } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = paymentStatusUpdateSchema.parse(body);
    const supabase = createSupabaseServiceClient();

    const intent = await transitionPaymentStatus(
      supabase,
      input.intentId,
      input.status,
      { callsId: input.callsId, txHash: input.txHash }
    );

    return NextResponse.json(intent);
  } catch (error) {
    return handleApiError(error);
  }
}
