import type { SupabaseClient } from "@supabase/supabase-js";
import type { PaymentIntent } from "@/lib/domain/x9a-compatible-intent";
import type { PaymentStatus } from "@/lib/domain/payment-status";
import { canTransition } from "@/lib/domain/payment-status";
import { getVendorBySlug } from "@/lib/repositories/vendors";
import {
  createIntent,
  getIntentById,
  updateIntentStatus,
} from "@/lib/repositories/payment-intents";
import { createEvent } from "@/lib/repositories/payment-events";
import { getTokenConfig } from "@/lib/config/tokens";
import { getServerEnv } from "@/lib/config/env";
import { isSupportedChain } from "@/lib/config/chains";
import { toAtomicAmount } from "@/lib/validation/amount";
import {
  IntentNotFoundError,
  InvalidTransitionError,
  ChainNotSupportedError,
} from "@/lib/errors";
import type { CreateIntentInput } from "@/lib/validation/schemas";
import { createPublicClient, http, type PublicClient } from "viem";
import { getChain } from "@/lib/config/chains";

const publicClientCache = new Map<number, PublicClient>();

function getPublicClient(chainId: number): PublicClient {
  let client = publicClientCache.get(chainId);
  if (!client) {
    client = createPublicClient({ chain: getChain(chainId), transport: http() });
    publicClientCache.set(chainId, client);
  }
  return client;
}

export async function createPaymentIntent(
  supabase: SupabaseClient,
  input: CreateIntentInput
): Promise<PaymentIntent> {
  const vendor = await getVendorBySlug(supabase, input.vendorSlug);
  if (!vendor) throw new IntentNotFoundError(input.vendorSlug);

  const chainId = input.chainId;
  if (!isSupportedChain(chainId)) throw new ChainNotSupportedError(chainId);

  const tokenConfig = getTokenConfig(chainId);
  const atomicAmount = toAtomicAmount(input.displayAmount, tokenConfig.decimals);

  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  const intent: PaymentIntent = {
    id: crypto.randomUUID(),
    version: "0.1.0",
    vendorId: vendor.id,
    vendorSlug: vendor.slug,
    invoiceId: input.invoiceId,
    merchantName: vendor.name,
    mode: "merchant_presented",
    displayCurrency: "USD",
    displayAmount: input.displayAmount,
    chainId,
    tokenAddress: tokenConfig.address,
    tokenSymbol: tokenConfig.symbol,
    tokenDecimals: tokenConfig.decimals,
    recipientAddress: getServerEnv().MERCHANT_WALLET_ADDRESS ?? vendor.recipientAddress,
    atomicAmount,
    nonce: crypto.randomUUID(),
    expiresAt,
    status: "awaiting_payment",
    createdAt: now,
    updatedAt: now,
  };

  const created = await createIntent(supabase, intent);

  await createEvent(supabase, {
    paymentIntentId: created.id,
    eventType: "intent_created",
    payload: { invoiceId: input.invoiceId, displayAmount: input.displayAmount },
  });

  return created;
}

export async function transitionPaymentStatus(
  supabase: SupabaseClient,
  intentId: string,
  newStatus: PaymentStatus,
  extra?: { callsId?: string; txHash?: string }
): Promise<PaymentIntent> {
  const intent = await getIntentById(supabase, intentId);
  if (!intent) throw new IntentNotFoundError(intentId);

  if (!canTransition(intent.status, newStatus)) {
    throw new InvalidTransitionError(intent.status, newStatus);
  }

  const portoExtension = {
    ...intent.portoExtension,
    ...(extra?.callsId && { callsId: extra.callsId }),
    ...(extra?.txHash && { txHash: extra.txHash }),
  };

  const [updated] = await Promise.all([
    updateIntentStatus(supabase, intentId, newStatus, {
      txHash: extra?.txHash,
      portoExtension,
    }),
    createEvent(supabase, {
      paymentIntentId: intentId,
      eventType: `status_${newStatus}`,
      payload: { from: intent.status, to: newStatus, ...extra },
    }),
  ]);

  return updated;
}

export async function verifyOnChain(
  supabase: SupabaseClient,
  intentId: string,
  txHash: string
): Promise<PaymentIntent> {
  const intent = await getIntentById(supabase, intentId);
  if (!intent) throw new IntentNotFoundError(intentId);

  const client = getPublicClient(intent.chainId);

  try {
    const receipt = await client.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    const newStatus: PaymentStatus =
      receipt.status === "success" ? "payment_confirmed" : "payment_failed";

    // Skip re-fetching intent since we already have it — validate transition inline
    if (!canTransition(intent.status, newStatus)) {
      throw new InvalidTransitionError(intent.status, newStatus);
    }

    const portoExtension = { ...intent.portoExtension, txHash };

    const [updated] = await Promise.all([
      updateIntentStatus(supabase, intentId, newStatus, {
        txHash,
        portoExtension,
      }),
      createEvent(supabase, {
        paymentIntentId: intentId,
        eventType: `status_${newStatus}`,
        payload: { from: intent.status, to: newStatus, txHash },
      }),
    ]);

    return updated;
  } catch (err) {
    if (err instanceof InvalidTransitionError) throw err;
    throw new Error("Failed to fetch transaction receipt");
  }
}
