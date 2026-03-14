export const PAYMENT_STATUSES = [
  "awaiting_payment",
  "wallet_connected",
  "payment_submitted",
  "payment_confirming",
  "payment_confirmed",
  "payment_failed",
  "expired",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const VALID_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  awaiting_payment: ["wallet_connected", "expired"],
  wallet_connected: ["payment_submitted", "payment_failed", "expired"],
  payment_submitted: ["payment_confirming", "payment_failed"],
  payment_confirming: ["payment_confirmed", "payment_failed"],
  payment_confirmed: [],
  payment_failed: [],
  expired: [],
};

export function canTransition(
  from: PaymentStatus,
  to: PaymentStatus
): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

export function isTerminal(status: PaymentStatus): boolean {
  return VALID_TRANSITIONS[status].length === 0;
}
