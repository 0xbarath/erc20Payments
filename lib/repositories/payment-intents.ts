import type { SupabaseClient } from "@supabase/supabase-js";
import type { PaymentIntent } from "@/lib/domain/x9a-compatible-intent";
import type { PaymentStatus } from "@/lib/domain/payment-status";
import { mapIntentFromDb, mapIntentToDb } from "./mappers";

export async function getIntentById(
  supabase: SupabaseClient,
  id: string
): Promise<PaymentIntent | null> {
  const { data, error } = await supabase
    .from("payment_intents")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return mapIntentFromDb(data);
}

export async function getIntentsByVendor(
  supabase: SupabaseClient,
  vendorSlug: string
): Promise<PaymentIntent[]> {
  const { data, error } = await supabase
    .from("payment_intents")
    .select("*")
    .eq("vendor_slug", vendorSlug)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapIntentFromDb);
}

export async function createIntent(
  supabase: SupabaseClient,
  intent: PaymentIntent
): Promise<PaymentIntent> {
  const row = mapIntentToDb(intent);
  const { data, error } = await supabase
    .from("payment_intents")
    .insert(row)
    .select()
    .single();

  if (error) throw error;
  return mapIntentFromDb(data);
}

export async function updateIntentStatus(
  supabase: SupabaseClient,
  id: string,
  status: PaymentStatus,
  extra?: { txHash?: string; portoExtension?: Record<string, unknown> }
): Promise<PaymentIntent> {
  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (extra?.txHash) updates.tx_hash = extra.txHash;
  if (extra?.portoExtension) updates.porto_extension = extra.portoExtension;

  const { data, error } = await supabase
    .from("payment_intents")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return mapIntentFromDb(data);
}
