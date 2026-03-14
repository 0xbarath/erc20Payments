"use client";

import { useState, useCallback, useEffect } from "react";
import { useSendCalls, useCallsStatus } from "wagmi";
import type { PaymentIntent } from "@/lib/domain/x9a-compatible-intent";
import { buildErc20TransferCall } from "@/lib/erc20/calldata";
import { postPaymentStatus, extractErrorMessage } from "@/lib/api-client";

type ExecutionStatus =
  | "idle"
  | "sending"
  | "polling"
  | "confirmed"
  | "failed";

export function usePaymentExecution(intent: PaymentIntent | null) {
  const [status, setStatus] = useState<ExecutionStatus>("idle");
  const [callsId, setCallsId] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { sendCallsAsync } = useSendCalls();

  const { data: callsStatus } = useCallsStatus({
    id: callsId ?? "",
    query: {
      enabled: !!callsId && status === "polling",
      refetchInterval: 2000,
    },
  });

  const intentId = intent?.id;

  // Handle calls status updates
  useEffect(() => {
    if (!callsStatus || status !== "polling" || !intentId) return;

    if (callsStatus.status === "success") {
      const hash = callsStatus.receipts?.[0]?.transactionHash ?? null;
      if (hash) setTxHash(hash);
      setStatus("confirmed");

      // Verify on-chain (this also transitions status server-side)
      fetch("/api/payment-status/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intentId }),
      }).catch(console.error);
    } else if (callsStatus.status === "failure") {
      setStatus("failed");
      setError("Transaction failed on-chain");
    }
  }, [callsStatus, status, intentId]);

  const execute = useCallback(async () => {
    if (!intent) return;

    setError(null);
    setStatus("sending");

    try {
      const call = buildErc20TransferCall(intent);
      const result = await sendCallsAsync({
        calls: [
          {
            to: call.to,
            data: call.data,
            value: call.value,
          },
        ],
      });

      const id = typeof result === "string" ? result : result.id;
      setCallsId(id);
      setStatus("polling");

      // Fire-and-forget: notify API of submission
      postPaymentStatus({
        intentId: intent.id,
        status: "payment_submitted",
        callsId: id,
      }).catch(console.error);
    } catch (err) {
      setStatus("failed");
      setError(extractErrorMessage(err, "Payment failed"));

      postPaymentStatus({
        intentId: intent.id,
        status: "payment_failed",
      }).catch(console.error);
    }
  }, [intent, sendCallsAsync]);

  return { execute, status, callsId, txHash, error };
}
