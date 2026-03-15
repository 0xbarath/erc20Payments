import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("crypto.randomUUID polyfill", () => {
  let savedRandomUUID: typeof globalThis.crypto.randomUUID;

  beforeEach(() => {
    vi.resetModules();
    savedRandomUUID = globalThis.crypto.randomUUID;
    // Node.js marks crypto.randomUUID as non-configurable, so we must
    // redefine the property to simulate a non-secure browser context.
    Object.defineProperty(globalThis.crypto, "randomUUID", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis.crypto, "randomUUID", {
      value: savedRandomUUID,
      writable: true,
      configurable: true,
    });
  });

  it("installs randomUUID when missing", async () => {
    expect(globalThis.crypto.randomUUID).toBeUndefined();
    await import("@/lib/porto/crypto-polyfill");
    expect(typeof globalThis.crypto.randomUUID).toBe("function");
  });

  it("produces valid UUID v4 format", async () => {
    await import("@/lib/porto/crypto-polyfill");
    const uuid = globalThis.crypto.randomUUID();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  it("does not overwrite existing randomUUID", async () => {
    globalThis.crypto.randomUUID = savedRandomUUID;
    const before = globalThis.crypto.randomUUID;
    await import("@/lib/porto/crypto-polyfill");
    expect(globalThis.crypto.randomUUID).toBe(before);
  });

  it("config + polyfill works in non-secure context", async () => {
    await import("@/lib/porto/crypto-polyfill");
    const { wagmiConfig } = await import("@/lib/porto/config");
    expect(wagmiConfig).toBeDefined();
    expect(wagmiConfig.chains.length).toBeGreaterThan(0);
  });
});
