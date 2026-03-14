"use client";

import { useState, useCallback } from "react";
import { postFaucetEvent, extractErrorMessage } from "@/lib/api-client";
import { requestFaucetFunds } from "@/lib/porto/faucet-adapter";

type FaucetStatus = "ready" | "requesting" | "funded" | "failed" | "rate_limited";

export function useFaucet() {
  const [status, setStatus] = useState<FaucetStatus>("ready");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestFunds = useCallback(
    async (params: {
      address: string;
      chainId: number;
      tokenAddress: string;
    }) => {
      setError(null);
      setStatus("requesting");

      try {
        // Record faucet request
        const recordRes = await postFaucetEvent({
          walletAddress: params.address,
          chainId: params.chainId,
          tokenAddress: params.tokenAddress,
        });

        if (!recordRes.ok) {
          throw new Error("Failed to record faucet request");
        }

        const event = await recordRes.json();

        try {
          const hash = await requestFaucetFunds(params);
          setTxHash(hash);
          setStatus("funded");

          postFaucetEvent({
            eventId: event.id,
            status: "funded",
            txHash: hash,
          }).catch(console.error);
        } catch (err) {
          const message = extractErrorMessage(err, "Faucet request failed");
          setError(message);
          setStatus("failed");

          postFaucetEvent({
            eventId: event.id,
            status: "failed",
            errorMessage: message,
          }).catch(console.error);
        }
      } catch (err) {
        setError(extractErrorMessage(err, "Failed to request funds"));
        setStatus("failed");
      }
    },
    []
  );

  return { requestFunds, status, txHash, error };
}
