import { describe, it, expect } from "vitest";
import { canTransition, isTerminal } from "@/lib/domain/payment-status";

describe("canTransition", () => {
  it("allows awaiting_payment → wallet_connected", () => {
    expect(canTransition("awaiting_payment", "wallet_connected")).toBe(true);
  });

  it("allows awaiting_payment → expired", () => {
    expect(canTransition("awaiting_payment", "expired")).toBe(true);
  });

  it("allows wallet_connected → payment_submitted", () => {
    expect(canTransition("wallet_connected", "payment_submitted")).toBe(true);
  });

  it("allows payment_submitted → payment_confirming", () => {
    expect(canTransition("payment_submitted", "payment_confirming")).toBe(true);
  });

  it("allows payment_confirming → payment_confirmed", () => {
    expect(canTransition("payment_confirming", "payment_confirmed")).toBe(true);
  });

  it("rejects awaiting_payment → payment_confirmed", () => {
    expect(canTransition("awaiting_payment", "payment_confirmed")).toBe(false);
  });

  it("rejects payment_confirmed → awaiting_payment", () => {
    expect(canTransition("payment_confirmed", "awaiting_payment")).toBe(false);
  });

  it("rejects expired → wallet_connected", () => {
    expect(canTransition("expired", "wallet_connected")).toBe(false);
  });
});

describe("isTerminal", () => {
  it("payment_confirmed is terminal", () => {
    expect(isTerminal("payment_confirmed")).toBe(true);
  });

  it("payment_failed is terminal", () => {
    expect(isTerminal("payment_failed")).toBe(true);
  });

  it("expired is terminal", () => {
    expect(isTerminal("expired")).toBe(true);
  });

  it("awaiting_payment is not terminal", () => {
    expect(isTerminal("awaiting_payment")).toBe(false);
  });

  it("payment_submitted is not terminal", () => {
    expect(isTerminal("payment_submitted")).toBe(false);
  });
});
