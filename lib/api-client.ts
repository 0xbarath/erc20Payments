export async function postPaymentStatus(params: {
  intentId: string;
  status: string;
  callsId?: string;
  txHash?: string | null;
}): Promise<Response> {
  return fetch("/api/payment-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}

export async function postFaucetEvent(
  body: Record<string, unknown>
): Promise<Response> {
  return fetch("/api/faucet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function extractErrorMessage(
  err: unknown,
  fallback: string = "Something went wrong"
): string {
  return err instanceof Error ? err.message : fallback;
}
