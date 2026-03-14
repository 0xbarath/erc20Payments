import { describe, it, expect } from "vitest";
import { buildErc20TransferCall } from "@/lib/erc20/calldata";
import { decodeFunctionData, erc20Abi } from "viem";
import type { PaymentIntent } from "@/lib/domain/x9a-compatible-intent";

const mockIntent: PaymentIntent = {
  id: "00000000-0000-0000-0000-000000000001",
  version: "0.1.0",
  vendorId: "00000000-0000-0000-0000-000000000002",
  vendorSlug: "test-vendor",
  invoiceId: "INV-001",
  merchantName: "Test Vendor",
  mode: "merchant_presented",
  displayCurrency: "USD",
  displayAmount: "25.00",
  chainId: 84532,
  tokenAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  tokenSymbol: "USDC",
  tokenDecimals: 6,
  recipientAddress: "0x742d35cc6634c0532925A3b844bc9E7595F2Bd1e",
  atomicAmount: "25000000",
  nonce: "00000000-0000-0000-0000-000000000003",
  expiresAt: "2099-01-01T00:00:00.000Z",
  status: "awaiting_payment",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("buildErc20TransferCall", () => {
  it("returns correct to address", () => {
    const call = buildErc20TransferCall(mockIntent);
    expect(call.to.toLowerCase()).toBe(mockIntent.tokenAddress.toLowerCase());
  });

  it("returns zero value", () => {
    const call = buildErc20TransferCall(mockIntent);
    expect(call.value).toBe(0n);
  });

  it("encodes correct transfer calldata", () => {
    const call = buildErc20TransferCall(mockIntent);
    const decoded = decodeFunctionData({
      abi: erc20Abi,
      data: call.data,
    });

    expect(decoded.functionName).toBe("transfer");
    expect((decoded.args![0] as string).toLowerCase()).toBe(
      mockIntent.recipientAddress.toLowerCase()
    );
    expect(decoded.args![1]).toBe(BigInt(mockIntent.atomicAmount));
  });
});
