import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function seed() {
  console.log("Seeding database...");

  // Upsert vendor
  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .upsert(
      {
        slug: "acme-store",
        name: "Acme Store",
        recipient_address: "0x742d35cc6634c0532925A3b844bc9E7595F2Bd1e",
        default_chain_id: 84532,
        default_token_address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      },
      { onConflict: "slug" }
    )
    .select()
    .single();

  if (vendorError) {
    console.error("Failed to seed vendor:", vendorError);
    process.exit(1);
  }

  console.log("Seeded vendor:", vendor.name);

  // Create a sample payment intent
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const nonce = crypto.randomUUID();

  const { data: intent, error: intentError } = await supabase
    .from("payment_intents")
    .insert({
      vendor_id: vendor.id,
      vendor_slug: "acme-store",
      invoice_id: `INV-${Date.now()}`,
      merchant_name: "Acme Store",
      display_currency: "USD",
      display_amount: "25.00",
      chain_id: 84532,
      token_address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      token_symbol: "USDC",
      token_decimals: 6,
      recipient_address: vendor.recipient_address,
      atomic_amount: "25000000",
      nonce,
      expires_at: expiresAt,
      status: "awaiting_payment",
    })
    .select()
    .single();

  if (intentError) {
    console.error("Failed to seed payment intent:", intentError);
    process.exit(1);
  }

  console.log("Seeded payment intent:", intent.id, "($25.00 USDC)");

  // Log initial event
  await supabase.from("payment_events").insert({
    payment_intent_id: intent.id,
    event_type: "intent_created",
    payload: { source: "seed" },
  });

  console.log("Seed complete!");
}

seed();
