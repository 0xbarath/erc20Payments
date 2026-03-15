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

    async function handleStatusUpdate() {
      if (callsStatus!.status === "success") {
        const hash = callsStatus!.receipts?.[0]?.transactionHash ?? null;
        if (hash) setTxHash(hash);

        // Step 1: Transition to payment_confirming in DB
        try {
          await postPaymentStatus({ intentId: intentId!, status: "payment_confirming" });
        } catch (err) {
          console.error("Failed to transition to payment_confirming:", err);
        }

        // Step 2: Verify on-chain — server transitions to payment_confirmed or payment_failed
        try {
          const res = await fetch("/api/payment-status/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ intentId, txHash: hash }),
          });
          if (!res.ok) throw new Error("Verify failed");
          setStatus("confirmed");
        } catch (err) {
          console.error("Verification failed:", err);
          setStatus("failed");
          setError("On-chain verification failed");
        }
      } else if (callsStatus!.status === "failure") {
        setStatus("failed");
        setError("Transaction failed on-chain");

        // Transition to payment_failed in DB
        postPaymentStatus({ intentId: intentId!, status: "payment_failed" }).catch(console.error);
      }
    }
    handleStatusUpdate();
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

      // Notify API of submission (continue to polling even on failure since tx was sent)
      try {
        await postPaymentStatus({
          intentId: intent.id,
          status: "payment_submitted",
          callsId: id,
        });
      } catch (err) {
        console.error("Failed to transition to payment_submitted:", err);
      }
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
