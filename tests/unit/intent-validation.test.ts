import { describe, it, expect } from "vitest";
import { createIntentInputSchema } from "@/lib/validation/schemas";

describe("createIntentInputSchema", () => {
  it("accepts valid input", () => {
    const input = {
      vendorSlug: "acme-store",
      invoiceId: "INV-001",
      displayAmount: "25.00",
      chainId: 84532,
    };
    expect(() => createIntentInputSchema.parse(input)).not.toThrow();
  });

  it("accepts whole number amounts", () => {
    const input = {
      vendorSlug: "acme-store",
      invoiceId: "INV-001",
      displayAmount: "100",
      chainId: 84532,
    };
    expect(() => createIntentInputSchema.parse(input)).not.toThrow();
  });

  it("rejects empty vendor slug", () => {
    const input = {
      vendorSlug: "",
      invoiceId: "INV-001",
      displayAmount: "25.00",
      chainId: 84532,
    };
    expect(() => createIntentInputSchema.parse(input)).toThrow();
  });

  it("rejects invalid amount format", () => {
    const input = {
      vendorSlug: "acme-store",
      invoiceId: "INV-001",
      displayAmount: "25.123",
      chainId: 84532,
    };
    expect(() => createIntentInputSchema.parse(input)).toThrow();
  });

  it("rejects negative amounts", () => {
    const input = {
      vendorSlug: "acme-store",
      invoiceId: "INV-001",
      displayAmount: "-25.00",
      chainId: 84532,
    };
    expect(() => createIntentInputSchema.parse(input)).toThrow();
  });

  it("rejects missing required fields", () => {
    expect(() => createIntentInputSchema.parse({})).toThrow();
  });
});
