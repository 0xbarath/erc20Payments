import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  recordFaucetRequest,
  updateFaucetResult,
} from "@/lib/services/faucet-service";
import { z } from "zod";
import { handleApiError } from "@/lib/api-utils";

const faucetRequestSchema = z.object({
  walletAddress: z.string().min(1),
  chainId: z.number(),
  tokenAddress: z.string().min(1),
  requestedAmount: z.string().optional(),
});

const faucetUpdateSchema = z.object({
  eventId: z.string().uuid(),
  status: z.string(),
  txHash: z.string().optional(),
  errorMessage: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const enableFaucet = process.env.NEXT_PUBLIC_ENABLE_FAUCET !== "false";
  if (!enableFaucet) {
    return NextResponse.json({ error: "Faucet is disabled" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const supabase = createSupabaseServiceClient();

    // If eventId is present, this is an update
    if (body.eventId) {
      const input = faucetUpdateSchema.parse(body);
      const event = await updateFaucetResult(
        supabase,
        input.eventId,
        input.status,
        input.txHash,
        input.errorMessage
      );
      return NextResponse.json(event);
    }

    // Otherwise, it's a new request
    const input = faucetRequestSchema.parse(body);
    const event = await recordFaucetRequest(
      supabase,
      input.walletAddress,
      input.chainId,
      input.tokenAddress,
      input.requestedAmount
    );
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
