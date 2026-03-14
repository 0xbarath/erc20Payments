import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createFaucetEvent,
  updateFaucetEvent,
} from "@/lib/repositories/faucet-events";

export async function recordFaucetRequest(
  supabase: SupabaseClient,
  walletAddress: string,
  chainId: number,
  tokenAddress: string,
  requestedAmount: string = "100000000" // 100 USDC in atomic
) {
  return createFaucetEvent(supabase, {
    walletAddress,
    chainId,
    tokenAddress,
    requestedAmount,
  });
}

export async function updateFaucetResult(
  supabase: SupabaseClient,
  eventId: string,
  status: string,
  txHash?: string,
  errorMessage?: string
) {
  return updateFaucetEvent(supabase, eventId, {
    status,
    txHash,
    errorMessage,
  });
}
