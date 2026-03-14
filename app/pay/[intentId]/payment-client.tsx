"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PaymentStatusBadge } from "@/components/payment/payment-status-badge";
import { PaymentActions } from "@/components/payment/payment-actions";
import { FaucetPanel } from "@/components/faucet/faucet-panel";
import { WalletStatus } from "@/components/payment/wallet-status";
import { usePaymentStatus } from "@/hooks/use-payment-status";
import type { PaymentIntent } from "@/lib/domain/x9a-compatible-intent";

export function PaymentClient({
  intent: initialIntent,
}: {
  intent: PaymentIntent;
}) {
  const { intent, refetch } = usePaymentStatus(initialIntent.id);
  const current = intent ?? initialIntent;

  const expired = new Date(current.expiresAt) < new Date();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">
            ${current.displayAmount}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {current.merchantName}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Invoice</span>
            <span>{current.invoiceId}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Token</span>
            <span>{current.tokenSymbol}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Network</span>
            <span>Chain {current.chainId}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <PaymentStatusBadge status={current.status} />
          </div>

          <Separator />

          {expired && current.status === "awaiting_payment" ? (
            <p className="text-center text-sm text-destructive">
              This payment has expired.
            </p>
          ) : (
            <PaymentActions intent={current} onStatusChange={refetch} />
          )}
        </CardContent>
      </Card>

      <WalletStatus />

      <FaucetPanel
        chainId={current.chainId}
        tokenAddress={current.tokenAddress}
      />
    </div>
  );
}
