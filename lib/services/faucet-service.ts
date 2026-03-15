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
  requestedAmount: string = "100000000000000000000" // 100 EXP in atomic (18 decimals)
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
