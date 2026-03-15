import { z } from "zod";
import { PAYMENT_STATUSES } from "@/lib/domain/payment-status";

export const createIntentInputSchema = z.object({
  vendorSlug: z.string().min(1),
  invoiceId: z.string().min(1),
  displayAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  chainId: z.number(),
  description: z.string().optional(),
});

export type CreateIntentInput = z.infer<typeof createIntentInputSchema>;

export const paymentStatusUpdateSchema = z.object({
  intentId: z.string().uuid(),
  status: z.enum(PAYMENT_STATUSES),
  callsId: z.string().optional(),
  txHash: z.string().optional(),
});

export type PaymentStatusUpdate = z.infer<typeof paymentStatusUpdateSchema>;

export const verifyPaymentSchema = z.object({
  intentId: z.string().uuid(),
  txHash: z.string().min(1),
});
