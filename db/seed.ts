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
        default_token_address: "0xfca413a634c4df6b98ebb970a44d9a32f8f5c64e",
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

  console.log("Seed complete!");
}

seed();
