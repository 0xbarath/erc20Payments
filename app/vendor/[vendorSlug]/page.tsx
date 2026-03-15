import { notFound } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getVendorBySlug } from "@/lib/repositories/vendors";
import { getIntentsByVendor } from "@/lib/repositories/payment-intents";
import { VendorHeader } from "@/components/vendor/vendor-header";
import { IntentListTable } from "@/components/vendor/intent-list-table";
import { VendorPageClient } from "./vendor-page-client";
import { isTerminal } from "@/lib/domain/payment-status";
import { buildPaymentUrl } from "@/lib/qr/serialize";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

  const now = new Date();
  const activeIntent = intents.find(
    (i) => !isTerminal(i.status) && new Date(i.expiresAt) > now
  );

  return (
    <div className="space-y-6">
      <VendorHeader vendor={vendor} />

      {activeIntent && (
        <VendorPageClient
          intent={activeIntent}
          paymentUrl={buildPaymentUrl(activeIntent)}
        />
      )}

      <IntentListTable intents={intents} vendorSlug={vendorSlug} />

      <Link href={`/vendor/${vendorSlug}/new`}>
        <Button variant="outline" className="w-full">
          Create New Invoice
        </Button>
      </Link>
    </div>
  );
}
