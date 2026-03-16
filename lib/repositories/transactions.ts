import type { SupabaseClient } from "@supabase/supabase-js";
import type { Transaction } from "@/lib/domain/transaction";

function mapTransactionFromDb(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    paymentIntentId: row.payment_intent_id as string,
    txHash: row.tx_hash as string,
    blockNumber: String(row.block_number),
    blockHash: row.block_hash as string,
    fromAddress: row.from_address as string,
    toAddress: row.to_address as string,
    gasUsed: String(row.gas_used),
    effectiveGasPrice: String(row.effective_gas_price),
    status: row.status as "success" | "reverted",
    chainId: row.chain_id as number,
    logCount: row.log_count as number,
    createdAt: row.created_at as string,
  };
}

export async function createTransaction(
  supabase: SupabaseClient,
  tx: {
    paymentIntentId: string;
    txHash: string;
    blockNumber: string;
    blockHash: string;
    fromAddress: string;
    toAddress: string;
    gasUsed: string;
    effectiveGasPrice: string;
    status: "success" | "reverted";
    chainId: number;
    logCount: number;
  }
): Promise<Transaction> {
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      payment_intent_id: tx.paymentIntentId,
      tx_hash: tx.txHash,
      block_number: tx.blockNumber,
      block_hash: tx.blockHash,
      from_address: tx.fromAddress,
      to_address: tx.toAddress,
      gas_used: tx.gasUsed,
      effective_gas_price: tx.effectiveGasPrice,
      status: tx.status,
      chain_id: tx.chainId,
      log_count: tx.logCount,
    })
    .select()
    .single();

  if (error) throw error;
  return mapTransactionFromDb(data);
}

export async function getTransactionByIntent(
  supabase: SupabaseClient,
  paymentIntentId: string
): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("payment_intent_id", paymentIntentId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapTransactionFromDb(data) : null;
}

export async function getTransactionsByWallet(
  supabase: SupabaseClient,
  walletAddress: string,
  limit = 10
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .ilike("from_address", walletAddress)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(mapTransactionFromDb);
}

export async function getTransactionByTxHash(
  supabase: SupabaseClient,
  txHash: string
): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("tx_hash", txHash)
    .maybeSingle();

  if (error) throw error;
  return data ? mapTransactionFromDb(data) : null;
}
