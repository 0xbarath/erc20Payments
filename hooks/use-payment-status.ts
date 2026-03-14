"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { PaymentIntent } from "@/lib/domain/x9a-compatible-intent";
import { isTerminal } from "@/lib/domain/payment-status";

export function usePaymentStatus(intentId: string | null) {
  const [intent, setIntent] = useState<PaymentIntent | null>(null);
  const [loading, setLoading] = useState(false);
  const terminalRef = useRef(false);

  const refetch = useCallback(async () => {
    if (!intentId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/payment-intents/${intentId}`);
      if (res.ok) {
        const data = await res.json();
        setIntent(data);
        terminalRef.current = isTerminal(data.status);
      }
    } catch {
      // Silently fail on poll errors
    } finally {
      setLoading(false);
    }
  }, [intentId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Poll every 2s unless terminal
  useEffect(() => {
    if (!intentId) return;

    const interval = setInterval(() => {
      if (terminalRef.current) return;
      refetch();
    }, 2000);

    return () => clearInterval(interval);
  }, [intentId, refetch]);

  return { intent, loading, refetch };
}
