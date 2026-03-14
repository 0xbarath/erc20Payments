/**
 * Prepared Calls Extension Point
 *
 * This module is a stub for a future extension where the server prepares
 * the full `wallet_sendCalls` payload (including calldata, gas estimates,
 * and metadata) and the client simply signs and submits.
 *
 * Flow would be:
 * 1. Server creates intent + builds calldata + estimates gas
 * 2. Server stores prepared payload in intent.portoExtension.preparedCalls
 * 3. Client fetches intent, extracts prepared payload
 * 4. Client calls wallet_sendCalls with the pre-built payload
 *
 * This avoids client-side calldata construction and enables server-side
 * validation of the exact transaction before submission.
 *
 * Not currently wired to the UI.
 */

export interface PreparedCall {
  to: `0x${string}`;
  data: `0x${string}`;
  value: string;
  gasLimit?: string;
}

export interface PreparedCallsPayload {
  chainId: number;
  calls: PreparedCall[];
  validUntil: string;
}

// Stub — implement when server-prepared flow is needed
export function buildPreparedCallsPayload(): PreparedCallsPayload {
  throw new Error("Prepared calls not yet implemented");
}
