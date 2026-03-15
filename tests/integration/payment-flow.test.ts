import { describe, it, expect } from "vitest";
import { canTransition, isTerminal } from "@/lib/domain/payment-status";
import { toAtomicAmount, fromAtomicAmount } from "@/lib/validation/amount";
import { buildErc20TransferCall } from "@/lib/erc20/calldata";
import { createIntentInputSchema } from "@/lib/validation/schemas";
import type { PaymentIntent } from "@/lib/domain/x9a-compatible-intent";

describe("Payment flow integration", () => {
  const intentInput = {
    vendorSlug: "acme-store",
    invoiceId: "INV-FLOW-001",
    displayAmount: "42.50",
    chainId: 84532,
  };

  it("validates input → computes atomic → builds calldata → transitions status", () => {
    // Step 1: Validate input
    const validated = createIntentInputSchema.parse(intentInput);
    expect(validated.displayAmount).toBe("42.50");

    // Step 2: Compute atomic amount
    const atomic = toAtomicAmount(validated.displayAmount, 18);
    expect(atomic).toBe("42500000000000000000");

    // Step 3: Verify round-trip
    const human = fromAtomicAmount(atomic, 18);
    expect(human).toBe("42.5");

    // Step 4: Build a mock intent
    const intent: PaymentIntent = {
      id: crypto.randomUUID(),
      version: "0.1.0",
      vendorId: crypto.randomUUID(),
      vendorSlug: validated.vendorSlug,
      invoiceId: validated.invoiceId,
      merchantName: "Acme Store",
      mode: "merchant_presented",
      displayCurrency: "USD",
      displayAmount: validated.displayAmount,
      chainId: validated.chainId,
      tokenAddress: "0xfca413a634c4df6b98ebb970a44d9a32f8f5c64e",
      tokenSymbol: "EXP",
      tokenDecimals: 18,
      recipientAddress: "0x742d35cc6634c0532925A3b844bc9E7595F2Bd1e",
      atomicAmount: atomic,
      nonce: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      status: "awaiting_payment",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Step 5: Build calldata
    const call = buildErc20TransferCall(intent);
    expect(call.to.toLowerCase()).toBe(intent.tokenAddress.toLowerCase());
    expect(call.value).toBe(0n);
    expect(call.data).toMatch(/^0x/);

    // Step 6: Verify status transitions
    expect(canTransition("awaiting_payment", "wallet_connected")).toBe(true);
    expect(canTransition("wallet_connected", "payment_submitted")).toBe(true);
    expect(canTransition("payment_submitted", "payment_confirming")).toBe(true);
    expect(canTransition("payment_confirming", "payment_confirmed")).toBe(true);
    expect(isTerminal("payment_confirmed")).toBe(true);

    // Step 7: Verify invalid transitions rejected
    expect(canTransition("awaiting_payment", "payment_confirmed")).toBe(false);
    expect(canTransition("payment_confirmed", "awaiting_payment")).toBe(false);
  });

  it("handles failure path", () => {
    expect(canTransition("wallet_connected", "payment_failed")).toBe(true);
    expect(canTransition("payment_submitted", "payment_failed")).toBe(true);
    expect(canTransition("payment_confirming", "payment_failed")).toBe(true);
    expect(isTerminal("payment_failed")).toBe(true);
  });

  it("handles expiry path", () => {
    expect(canTransition("awaiting_payment", "expired")).toBe(true);
    expect(canTransition("wallet_connected", "expired")).toBe(true);
    expect(isTerminal("expired")).toBe(true);
  });
});
