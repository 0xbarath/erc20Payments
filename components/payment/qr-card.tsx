"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PaymentStatusBadge } from "./payment-status-badge";
import type { PaymentIntent } from "@/lib/domain/x9a-compatible-intent";
import { isTerminal } from "@/lib/domain/payment-status";

function useCountdown(expiresAt: string) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    function update() {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining("Expired");
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining(`${mins}:${secs.toString().padStart(2, "0")}`);
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return remaining;
}

export function QrCard({
  intent,
  paymentUrl,
  emvQrData,
}: {
  intent: PaymentIntent;
  paymentUrl: string;
  emvQrData: string;
}) {
  const countdown = useCountdown(intent.expiresAt);
  const expired = countdown === "Expired";
  const terminal = isTerminal(intent.status);

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          ${intent.displayAmount} {intent.displayCurrency}
        </CardTitle>
        <CardDescription>
          Invoice: {intent.invoiceId}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="rounded-lg bg-white p-4">
          <QRCode
            value={emvQrData}
            size={200}
            level="M"
            style={{ opacity: expired || terminal ? 0.3 : 1 }}
          />
        </div>

        <Separator />

        <div className="flex w-full items-center justify-between text-sm">
          <span className="text-muted-foreground">Status</span>
          <PaymentStatusBadge status={intent.status} />
        </div>

        <div className="flex w-full items-center justify-between text-sm">
          <span className="text-muted-foreground">Expires</span>
          <span className={expired ? "text-destructive" : ""}>
            {countdown}
          </span>
        </div>

        <div className="flex w-full items-center justify-between text-sm">
          <span className="text-muted-foreground">Token</span>
          <span>
            {intent.tokenSymbol} on Chain {intent.chainId}
          </span>
        </div>

        {!expired && !terminal && (
          <Link
            href={paymentUrl}
            className="w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Open Payment Page
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
