import type { SupabaseClient } from "@supabase/supabase-js";

export interface FaucetEvent {
  id: string;
  walletAddress: string;
  chainId: number;
  tokenAddress: string;
  requestedAmount: string;
  status: string;
  txHash: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export async function createFaucetEvent(
  supabase: SupabaseClient,
  event: {
    walletAddress: string;
    chainId: number;
    tokenAddress: string;
    requestedAmount: string;
  }
): Promise<FaucetEvent> {
  const { data, error } = await supabase
    .from("faucet_events")
    .insert({
      wallet_address: event.walletAddress,
      chain_id: event.chainId,
      token_address: event.tokenAddress,
      requested_amount: event.requestedAmount,
    })
    .select()
    .single();

  if (error) throw error;
  return mapFaucetEvent(data);
}

export async function updateFaucetEvent(
  supabase: SupabaseClient,
  id: string,
  updates: { status: string; txHash?: string; errorMessage?: string }
): Promise<FaucetEvent> {
  const { data, error } = await supabase
    .from("faucet_events")
    .update({
      status: updates.status,
      tx_hash: updates.txHash,
      error_message: updates.errorMessage,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return mapFaucetEvent(data);
}

function mapFaucetEvent(row: Record<string, unknown>): FaucetEvent {
  return {
    id: row.id as string,
    walletAddress: row.wallet_address as string,
    chainId: row.chain_id as number,
    tokenAddress: row.token_address as string,
    requestedAmount: row.requested_amount as string,
    status: row.status as string,
    txHash: row.tx_hash as string | null,
    errorMessage: row.error_message as string | null,
    createdAt: row.created_at as string,
  };
}
