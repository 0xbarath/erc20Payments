import type { SupabaseClient } from "@supabase/supabase-js";
import { mapVendorFromDb, type Vendor, type VendorRow } from "./mappers";

export async function getVendorBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<Vendor | null> {
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return mapVendorFromDb(data as VendorRow);
}

export async function createVendor(
  supabase: SupabaseClient,
  vendor: {
    slug: string;
    name: string;
    recipientAddress: string;
    defaultChainId: number;
    defaultTokenAddress: string;
  }
): Promise<Vendor> {
  const { data, error } = await supabase
    .from("vendors")
    .insert({
      slug: vendor.slug,
      name: vendor.name,
      recipient_address: vendor.recipientAddress,
      default_chain_id: vendor.defaultChainId,
      default_token_address: vendor.defaultTokenAddress,
    })
    .select()
    .single();

  if (error) throw error;
  return mapVendorFromDb(data as VendorRow);
}
