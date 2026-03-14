import { describe, it, expect } from "vitest";
import { toAtomicAmount, fromAtomicAmount } from "@/lib/validation/amount";

describe("toAtomicAmount", () => {
  it("converts whole numbers", () => {
    expect(toAtomicAmount("25", 6)).toBe("25000000");
  });

  it("converts decimal amounts", () => {
    expect(toAtomicAmount("25.50", 6)).toBe("25500000");
  });

  it("converts small amounts", () => {
    expect(toAtomicAmount("0.01", 6)).toBe("10000");
  });

  it("handles zero", () => {
    expect(toAtomicAmount("0", 6)).toBe("0");
  });

  it("handles max decimals", () => {
    expect(toAtomicAmount("1.123456", 6)).toBe("1123456");
  });

  it("truncates extra decimals", () => {
    expect(toAtomicAmount("1.1234567", 6)).toBe("1123456");
  });

  it("pads short decimals", () => {
    expect(toAtomicAmount("1.1", 6)).toBe("1100000");
  });
});

describe("fromAtomicAmount", () => {
  it("converts whole token amounts", () => {
    expect(fromAtomicAmount("25000000", 6)).toBe("25");
  });

  it("converts fractional amounts", () => {
    expect(fromAtomicAmount("25500000", 6)).toBe("25.5");
  });

  it("converts small amounts", () => {
    expect(fromAtomicAmount("10000", 6)).toBe("0.01");
  });

  it("handles zero", () => {
    expect(fromAtomicAmount("0", 6)).toBe("0");
  });

  it("preserves precision", () => {
    expect(fromAtomicAmount("1123456", 6)).toBe("1.123456");
  });
});
