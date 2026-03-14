"use client";

import { Badge } from "@/components/ui/badge";
import type { PaymentStatus } from "@/lib/domain/payment-status";

const STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  awaiting_payment: { label: "Awaiting Payment", variant: "outline" },
  wallet_connected: { label: "Wallet Connected", variant: "secondary" },
  payment_submitted: { label: "Submitted", variant: "secondary" },
  payment_confirming: { label: "Confirming", variant: "default" },
  payment_confirmed: { label: "Confirmed", variant: "default" },
  payment_failed: { label: "Failed", variant: "destructive" },
  expired: { label: "Expired", variant: "destructive" },
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
