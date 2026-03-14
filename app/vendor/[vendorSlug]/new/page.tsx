import { notFound } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getVendorBySlug } from "@/lib/repositories/vendors";
import { VendorHeader } from "@/components/vendor/vendor-header";
import { InvoiceForm } from "@/components/vendor/invoice-form";

export default async function NewInvoicePage({
  params,
}: {
  params: Promise<{ vendorSlug: string }>;
}) {
  const { vendorSlug } = await params;
  const supabase = createSupabaseServiceClient();

  const vendor = await getVendorBySlug(supabase, vendorSlug);
  if (!vendor) notFound();

  return (
    <div className="space-y-6">
      <VendorHeader vendor={vendor} />
      <InvoiceForm vendorSlug={vendorSlug} />
    </div>
  );
}
