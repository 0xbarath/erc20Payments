import { notFound } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getVendorBySlug } from "@/lib/repositories/vendors";
import { getIntentsByVendor } from "@/lib/repositories/payment-intents";
import { VendorHeader } from "@/components/vendor/vendor-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { VendorPageClient } from "./vendor-page-client";

export default async function VendorPage({
  params,
}: {
  params: Promise<{ vendorSlug: string }>;
}) {
  const { vendorSlug } = await params;
  const supabase = createSupabaseServiceClient();

  const [vendor, intents] = await Promise.all([
    getVendorBySlug(supabase, vendorSlug),
    getIntentsByVendor(supabase, vendorSlug),
  ]);

  if (!vendor) notFound();

  const activeIntent = intents.find(
    (i) => i.status === "awaiting_payment" || i.status === "wallet_connected"
  );

  return (
    <div className="space-y-6">
      <VendorHeader vendor={vendor} />

      {activeIntent ? (
        <VendorPageClient intent={activeIntent} />
      ) : (
        <div className="text-center text-sm text-muted-foreground">
          No active payment intent. Create a new invoice below.
        </div>
      )}

      <Link href={`/vendor/${vendorSlug}/new`}>
        <Button variant="outline" className="w-full">
          Create New Invoice
        </Button>
      </Link>
    </div>
  );
}
