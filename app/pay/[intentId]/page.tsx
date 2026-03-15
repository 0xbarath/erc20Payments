import { notFound } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getIntentById } from "@/lib/repositories/payment-intents";
import { buildPaymentUrl } from "@/lib/qr/serialize";
import { PaymentClient } from "./payment-client";

export default async function PayPage({
  params,
}: {
  params: Promise<{ intentId: string }>;
}) {
  const { intentId } = await params;
  const supabase = createSupabaseServiceClient();
  const intent = await getIntentById(supabase, intentId);

  if (!intent) notFound();

  const paymentUrl = buildPaymentUrl(intent);

  return <PaymentClient intent={intent} paymentUrl={paymentUrl} />;
}
