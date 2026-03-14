"use client";

import { QrCard } from "@/components/payment/qr-card";
import type { PaymentIntent } from "@/lib/domain/x9a-compatible-intent";
import { usePaymentStatus } from "@/hooks/use-payment-status";
import { buildPaymentUrl, buildEmvQrData } from "@/lib/qr/serialize";

export function VendorPageClient({ intent: initialIntent }: { intent: PaymentIntent }) {
  const { intent } = usePaymentStatus(initialIntent.id);
  const current = intent ?? initialIntent;

  return (
    <QrCard
      intent={current}
      paymentUrl={buildPaymentUrl(current)}
      emvQrData={buildEmvQrData(current)}
    />
  );
}
