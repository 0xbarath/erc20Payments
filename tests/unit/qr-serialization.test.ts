import { describe, it, expect, vi } from "vitest";

// Mock the env module
vi.mock("@/lib/config/env", () => ({
  getClientEnv: () => ({
    NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-key",
    NEXT_PUBLIC_APP_URL: "https://pay.example.com",
    NEXT_PUBLIC_DEFAULT_CHAIN_ID: 84532,
    NEXT_PUBLIC_ENABLE_FAUCET: true,
  }),
}));

import { buildPaymentUrl, buildEmvQrData, parseEmvQrData } from "@/lib/qr/serialize";
import { computeCrc16, encodeTlv, decodeTlv } from "@/lib/qr/emv-tlv";
import type { PaymentIntent } from "@/lib/domain/x9a-compatible-intent";

const fixture: PaymentIntent = {
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  version: "0.1.0",
  vendorId: "v1v2v3v4-v5v6-7890-abcd-ef1234567890",
  vendorSlug: "acme-store",
  invoiceId: "INV-001",
  merchantName: "Acme Store",
  mode: "merchant_presented",
  displayCurrency: "USD",
  displayAmount: "25.00",
  chainId: 84532,
  tokenAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  tokenSymbol: "USDC",
  tokenDecimals: 6,
  recipientAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD1e",
  atomicAmount: "25000000",
  nonce: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  expiresAt: "2026-03-14T12:00:00.000Z",
  status: "awaiting_payment",
  createdAt: "2026-03-14T11:00:00.000Z",
  updatedAt: "2026-03-14T11:00:00.000Z",
};

describe("buildPaymentUrl", () => {
  it("constructs correct URL with intent ID", () => {
    const url = buildPaymentUrl(fixture);
    expect(url).toBe(`https://pay.example.com/pay/${fixture.id}`);
  });

  it("uses the configured app URL", () => {
    const url = buildPaymentUrl(fixture);
    expect(url).toContain("pay.example.com");
  });
});

describe("EMVCo TLV primitives", () => {
  it("encodeTlv produces correct tag-length-value", () => {
    expect(encodeTlv("00", "01")).toBe("000201");
    expect(encodeTlv("54", "25.00")).toBe("540525.00");
  });

  it("decodeTlv round-trips", () => {
    const encoded = encodeTlv("00", "01") + encodeTlv("01", "12");
    const decoded = decodeTlv(encoded);
    expect(decoded.get("00")).toBe("01");
    expect(decoded.get("01")).toBe("12");
  });

  it("computeCrc16 produces 4-char hex", () => {
    const crc = computeCrc16("000201010212");
    expect(crc).toMatch(/^[0-9A-F]{4}$/);
  });
});

describe("buildEmvQrData", () => {
  const qr = buildEmvQrData(fixture);

  it("starts with Payload Format Indicator 000201", () => {
    expect(qr.startsWith("000201")).toBe(true);
  });

  it("contains Point of Initiation Method (dynamic)", () => {
    expect(qr).toContain("010212");
  });

  it("contains transaction currency USD (840)", () => {
    expect(qr).toContain("5303840");
  });

  it("contains transaction amount in tag 54", () => {
    expect(qr).toContain("540525.00");
  });

  it("contains merchant name in tag 59", () => {
    expect(qr).toContain("5910Acme Store");
  });

  it("contains country code US in tag 58", () => {
    expect(qr).toContain("5802US");
  });

  it("contains erc20 GUID in unreserved templates", () => {
    expect(qr).toContain("0005erc20");
  });

  it("contains token info in tag 80 (chain ID, symbol)", () => {
    expect(qr).toContain("010584532"); // chain ID
    expect(qr).toContain("0304USDC"); // token symbol
  });

  it("contains transaction details in tag 81 (recipient, amount)", () => {
    expect(qr).toContain(fixture.recipientAddress);
    expect(qr).toContain("25000000");
  });

  it("ends with valid CRC (tag 63, 4 hex chars)", () => {
    expect(qr).toMatch(/6304[0-9A-F]{4}$/);
  });

  it("keeps all template values ≤ 99 chars (EMVCo 2-digit length)", () => {
    const fields = decodeTlv(qr);
    for (const [, value] of fields) {
      expect(value.length).toBeLessThanOrEqual(99);
    }
  });
});

describe("parseEmvQrData", () => {
  it("round-trips with buildEmvQrData", () => {
    const qr = buildEmvQrData(fixture);
    const parsed = parseEmvQrData(qr);

    // Standard fields
    expect(parsed.standard.get("00")).toBe("01");
    expect(parsed.standard.get("01")).toBe("12");
    expect(parsed.standard.get("53")).toBe("840");
    expect(parsed.standard.get("54")).toBe("25.00");
    expect(parsed.standard.get("58")).toBe("US");
    expect(parsed.standard.get("59")).toBe("Acme Store");

    // Additional Data (tag 62)
    expect(parsed.additionalData).not.toBeNull();
    expect(parsed.additionalData!.get("01")).toBe("INV-001");
    expect(parsed.additionalData!.get("05")).toBe(fixture.id);

    // Token Info (tag 80)
    expect(parsed.tokenInfo).not.toBeNull();
    expect(parsed.tokenInfo!.get("00")).toBe("erc20");
    expect(parsed.tokenInfo!.get("01")).toBe("84532");
    expect(parsed.tokenInfo!.get("02")).toBe(fixture.tokenAddress);
    expect(parsed.tokenInfo!.get("03")).toBe("USDC");
    expect(parsed.tokenInfo!.get("04")).toBe("6");

    // Transaction Details (tag 81)
    expect(parsed.txDetails).not.toBeNull();
    expect(parsed.txDetails!.get("00")).toBe("erc20");
    expect(parsed.txDetails!.get("01")).toBe(fixture.recipientAddress);
    expect(parsed.txDetails!.get("02")).toBe("25000000");
  });

  it("throws on corrupted CRC", () => {
    const qr = buildEmvQrData(fixture);
    const corrupted = qr.slice(0, -1) + (qr.slice(-1) === "0" ? "1" : "0");
    expect(() => parseEmvQrData(corrupted)).toThrow("CRC mismatch");
  });
});
