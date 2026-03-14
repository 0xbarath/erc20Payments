/**
 * Application-defined schema inspired by X9 payment QR concepts.
 * Not a normative X9.150 implementation.
 *
 * This schema defines the structure for payment intents used in the
 * vendor checkout flow. The "x9a-compatible" naming reflects architectural
 * alignment with X9 payment data concepts, not standards compliance.
 */

import { z } from "zod";
import { PAYMENT_STATUSES } from "./payment-status";

export const portoExtensionSchema = z.object({
  callsId: z.string().optional(),
  txHash: z.string().optional(),
});

export const paymentIntentSchema = z.object({
  id: z.string().uuid(),
  version: z.literal("0.1.0"),
  vendorId: z.string().uuid(),
  vendorSlug: z.string(),
  invoiceId: z.string(),
  merchantName: z.string(),
  mode: z.literal("merchant_presented"),
  displayCurrency: z.literal("USD"),
  displayAmount: z.string(),
  chainId: z.number(),
  tokenAddress: z.string(),
  tokenSymbol: z.string(),
  tokenDecimals: z.number(),
  recipientAddress: z.string(),
  atomicAmount: z.string(),
  nonce: z.string().uuid(),
  expiresAt: z.string().datetime(),
  status: z.enum(PAYMENT_STATUSES),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  portoExtension: portoExtensionSchema.optional(),
});

export type PaymentIntent = z.infer<typeof paymentIntentSchema>;
export type PortoExtension = z.infer<typeof portoExtensionSchema>;
