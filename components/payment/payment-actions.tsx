"use client";

import { useEffect, useRef } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import type { PaymentIntent } from "@/lib/domain/x9a-compatible-intent";
import { usePaymentExecution } from "@/hooks/use-payment-execution";
import { isTerminal } from "@/lib/domain/payment-status";
import { postPaymentStatus } from "@/lib/api-client";

export function PaymentActions({
  intent,
  onStatusChange,
}: {
  intent: PaymentIntent;
  onStatusChange?: () => void;
}) {
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { execute, status, txHash, error } = usePaymentExecution(intent);
  const transitioningRef = useRef(false);

  const terminal = isTerminal(intent.status);

  // Auto-transition to wallet_connected when wallet is already connected on mount
  useEffect(() => {
    if (isConnected && intent.status === "awaiting_payment" && !transitioningRef.current) {
      transitioningRef.current = true;
      postPaymentStatus({ intentId: intent.id, status: "wallet_connected" })
        .then((res) => {
          if (res.ok) onStatusChange?.();
        })
        .finally(() => { transitioningRef.current = false; });
    }
  }, [isConnected, intent.status, intent.id, onStatusChange]);

  if (terminal) {
    if (intent.status === "payment_confirmed") {
      return <p className="text-center text-sm text-green-500">Payment confirmed!</p>;
    }
    if (intent.status === "payment_failed") {
      return <p className="text-center text-sm text-destructive">Payment failed.</p>;
    }
    return <p className="text-center text-sm text-muted-foreground">This payment has expired.</p>;
  }

  if (!isConnected) {
    return (
      <Button
        className="w-full"
        size="lg"
        onClick={() => {
          const connector = connectors[0];
          if (connector) {
            connect({ connector });
          }
        }}
      >
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <Button variant="ghost" size="sm" onClick={() => disconnect()}>
          Disconnect
        </Button>
      </div>

      {status === "idle" && intent.status === "awaiting_payment" && (
        <Button className="w-full" size="lg" disabled>
          Connecting...
        </Button>
      )}

      {status === "idle" && intent.status !== "awaiting_payment" && (
        <Button className="w-full" size="lg" onClick={execute}>
          Pay ${intent.displayAmount} {intent.tokenSymbol}
        </Button>
      )}

      {status === "sending" && (
        <Button className="w-full" size="lg" disabled>
          Confirming in wallet...
        </Button>
      )}

      {status === "polling" && (
        <Button className="w-full" size="lg" disabled>
          Waiting for confirmation...
        </Button>
      )}

      {status === "confirmed" && (
        <div className="text-center text-sm text-green-500">
          Payment confirmed!
          {txHash && (
            <p className="mt-1 text-xs text-muted-foreground break-all">
              Tx: {txHash}
            </p>
          )}
        </div>
      )}

      {status === "failed" && (
        <div className="space-y-2">
          <p className="text-center text-sm text-destructive">{error}</p>
          <Button className="w-full" variant="outline" onClick={execute}>
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
