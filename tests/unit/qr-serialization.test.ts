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
import { computeCrc16, encodeTlv, decodeTlv, encodeTemplate, decodeTemplate } from "@/lib/qr/emv-tlv";
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
  tokenAddress: "0xfca413a634c4df6b98ebb970a44d9a32f8f5c64e",
  tokenSymbol: "EXP",
  tokenDecimals: 18,
  recipientAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD1e",
  atomicAmount: "25000000000000000000",
  nonce: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  expiresAt: "2026-03-14T12:00:00.000Z",
  status: "awaiting_payment",
  createdAt: "2026-03-14T11:00:00.000Z",
  updatedAt: "2026-03-14T11:00:00.000Z",
};

const fixture2: PaymentIntent = {
  id: "deadbeef-1234-5678-9abc-def012345678",
  version: "0.1.0",
  vendorId: "bbbbbbbb-cccc-dddd-eeee-ffffffffffff",
  vendorSlug: "bobs-tacos",
  invoiceId: "INV-999",
  merchantName: "Bob's Tacos",
  mode: "merchant_presented",
  displayCurrency: "USD",
  displayAmount: "0.01",
  chainId: 11155420,
  tokenAddress: "0x1234567890abcdef1234567890abcdef12345678",
  tokenSymbol: "USDC",
  tokenDecimals: 6,
  recipientAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
  atomicAmount: "10000",
  nonce: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  expiresAt: "2026-04-01T00:00:00.000Z",
  status: "awaiting_payment",
  createdAt: "2026-03-15T10:00:00.000Z",
  updatedAt: "2026-03-15T10:00:00.000Z",
};

describe("buildPaymentUrl", () => {
  it("constructs a valid URL with the configured domain and intent ID", () => {
    const url = buildPaymentUrl(fixture);
    expect(url).toBe(`https://pay.example.com/pay/${fixture.id}`);
    // Verify it's actually a valid URL
    const parsed = new URL(url);
    expect(parsed.pathname).toBe(`/pay/${fixture.id}`);
  });
});

describe("EMVCo TLV primitives", () => {
  it("encodeTlv produces correct tag-length-value", () => {
    expect(encodeTlv("00", "01")).toBe("000201");
    expect(encodeTlv("54", "25.00")).toBe("540525.00");
  });

  it("decodeTlv round-trips with encodeTlv", () => {
    const encoded = encodeTlv("00", "01") + encodeTlv("01", "12");
    const decoded = decodeTlv(encoded);
    expect(decoded.get("00")).toBe("01");
    expect(decoded.get("01")).toBe("12");
  });

  it("decodeTlv returns empty map for empty input", () => {
    expect(decodeTlv("").size).toBe(0);
  });

  it("decodeTlv returns empty map for truncated input (no length field)", () => {
    expect(decodeTlv("00").size).toBe(0);
  });

  it("decodeTlv parses valid prefix and stops at trailing junk", () => {
    // "000201" = tag 00, len 02, value "01" — valid
    // "9999" = trailing junk (tag 99, no full length+value)
    const decoded = decodeTlv("0002019999");
    expect(decoded.size).toBe(1);
    expect(decoded.get("00")).toBe("01");
  });

  it("computeCrc16 produces a known pinned value", () => {
    // Pin to a known-good CRC so algorithm regressions are caught
    expect(computeCrc16("000201010212")).toBe("342A");
  });

  it("computeCrc16 is sensitive to input changes", () => {
    const crc1 = computeCrc16("000201010212");
    const crc2 = computeCrc16("000201010213"); // changed last char
    expect(crc1).not.toBe(crc2);
  });

  it("encodeTemplate/decodeTemplate preserve nested sub-tags", () => {
    const inner = encodeTlv("01", "hello") + encodeTlv("02", "world");
    const outer = encodeTemplate("80", inner);
    const outerFields = decodeTlv(outer);
    expect(outerFields.has("80")).toBe(true);
    const innerFields = decodeTemplate(outerFields.get("80")!);
    expect(innerFields.get("01")).toBe("hello");
    expect(innerFields.get("02")).toBe("world");
  });
});

describe("buildEmvQrData", () => {
  it("round-trips through parseEmvQrData with correct field values", () => {
    const qr = buildEmvQrData(fixture);
    const parsed = parseEmvQrData(qr);

    // Standard fields via parsed tags (not loose toContain)
    expect(parsed.standard.get("00")).toBe("01"); // Payload Format Indicator
    expect(parsed.standard.get("01")).toBe("12"); // Point of Initiation (dynamic)
    expect(parsed.standard.get("53")).toBe("840"); // Currency USD
    expect(parsed.standard.get("54")).toBe("25.00"); // Amount
    expect(parsed.standard.get("58")).toBe("US"); // Country Code
    expect(parsed.standard.get("59")).toBe("Acme Store"); // Merchant Name

    // Additional Data (tag 62)
    expect(parsed.additionalData).not.toBeNull();
    expect(parsed.additionalData!.get("01")).toBe("INV-001");
    expect(parsed.additionalData!.get("05")).toBe(fixture.id);

    // Token Info (tag 80)
    expect(parsed.tokenInfo).not.toBeNull();
    expect(parsed.tokenInfo!.get("00")).toBe("erc20");
    expect(parsed.tokenInfo!.get("01")).toBe("84532");
    expect(parsed.tokenInfo!.get("02")).toBe(fixture.tokenAddress);
    expect(parsed.tokenInfo!.get("03")).toBe("EXP");
    expect(parsed.tokenInfo!.get("04")).toBe("18");

    // Transaction Details (tag 81)
    expect(parsed.txDetails).not.toBeNull();
    expect(parsed.txDetails!.get("00")).toBe("erc20");
    expect(parsed.txDetails!.get("01")).toBe(fixture.recipientAddress);
    expect(parsed.txDetails!.get("02")).toBe("25000000000000000000");
  });

  it("ends with valid CRC (tag 63, 4 hex chars)", () => {
    const qr = buildEmvQrData(fixture);
    expect(qr).toMatch(/6304[0-9A-F]{4}$/);
  });

  it("keeps all template values ≤ 99 chars (EMVCo 2-digit length)", () => {
    const qr = buildEmvQrData(fixture);
    const fields = decodeTlv(qr);
    for (const [, value] of fields) {
      expect(value.length).toBeLessThanOrEqual(99);
    }
  });

  it("produces different output for different fixtures", () => {
    const qr1 = buildEmvQrData(fixture);
    const qr2 = buildEmvQrData(fixture2);
    expect(qr1).not.toBe(qr2);

    const parsed2 = parseEmvQrData(qr2);
    expect(parsed2.standard.get("54")).toBe("0.01");
    expect(parsed2.standard.get("59")).toBe("Bob's Tacos");
    expect(parsed2.tokenInfo!.get("01")).toBe("11155420");
    expect(parsed2.tokenInfo!.get("03")).toBe("USDC");
    expect(parsed2.txDetails!.get("02")).toBe("10000");
  });

  it("handles small amounts like 0.01", () => {
    const intent = { ...fixture, displayAmount: "0.01" };
    const qr = buildEmvQrData(intent);
    const parsed = parseEmvQrData(qr);
    expect(parsed.standard.get("54")).toBe("0.01");
  });

  it("handles long merchant name (>25 chars)", () => {
    const longName = "A".repeat(80);
    const intent = { ...fixture, merchantName: longName };
    const qr = buildEmvQrData(intent);
    const parsed = parseEmvQrData(qr);
    expect(parsed.standard.get("59")).toBe(longName);
  });
});

describe("parseEmvQrData", () => {
  it("throws on corrupted CRC", () => {
    const qr = buildEmvQrData(fixture);
    const corrupted = qr.slice(0, -1) + (qr.slice(-1) === "0" ? "1" : "0");
    expect(() => parseEmvQrData(corrupted)).toThrow("CRC mismatch");
  });
});
