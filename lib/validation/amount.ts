export function toAtomicAmount(humanAmount: string, decimals: number): string {
  const [whole = "0", fraction = ""] = humanAmount.split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  const raw = whole + paddedFraction;
  // Remove leading zeros but keep at least "0"
  const trimmed = raw.replace(/^0+/, "") || "0";
  return trimmed;
}

export function fromAtomicAmount(
  atomicAmount: string,
  decimals: number
): string {
  const padded = atomicAmount.padStart(decimals + 1, "0");
  const whole = padded.slice(0, padded.length - decimals);
  const fraction = padded.slice(padded.length - decimals);
  const trimmedFraction = fraction.replace(/0+$/, "");
  return trimmedFraction ? `${whole}.${trimmedFraction}` : whole;
}
