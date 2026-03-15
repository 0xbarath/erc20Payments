"use client";

import { QrCard } from "@/components/payment/qr-card";
import type { PaymentIntent } from "@/lib/domain/x9a-compatible-intent";
import { usePaymentStatus } from "@/hooks/use-payment-status";

export function VendorPageClient({
  intent: initialIntent,
  paymentUrl,
}: {
  intent: PaymentIntent;
  paymentUrl: string;
}) {
  const { intent } = usePaymentStatus(initialIntent.id);
  const current = intent ?? initialIntent;

  return (
    <QrCard
      intent={current}
      paymentUrl={paymentUrl}
    />
  );
}
