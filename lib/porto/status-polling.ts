import type { PaymentStatus } from "@/lib/domain/payment-status";

type CallsStatus = "CONFIRMED" | "PENDING";

export function mapCallsStatusToPaymentStatus(
  callsStatus: CallsStatus | (string & {})
): PaymentStatus {
  switch (callsStatus) {
    case "CONFIRMED":
      return "payment_confirmed";
    case "PENDING":
      return "payment_confirming";
    default:
      return "payment_failed";
  }
}
