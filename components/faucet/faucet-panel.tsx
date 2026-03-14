"use client";

import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFaucet } from "@/hooks/use-faucet";

export function FaucetPanel({
  chainId,
  tokenAddress,
}: {
  chainId: number;
  tokenAddress: string;
}) {
  const { address, isConnected } = useAccount();
  const { requestFunds, status, txHash, error } = useFaucet();

  const enabled = process.env.NEXT_PUBLIC_ENABLE_FAUCET !== "false";
  if (!enabled || !isConnected || !address) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Testnet Faucet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          disabled={status === "requesting"}
          onClick={() =>
            requestFunds({ address, chainId, tokenAddress })
          }
        >
          {status === "requesting"
            ? "Requesting..."
            : status === "funded"
              ? "Funded! Request again"
              : "Get test USDC"}
        </Button>

        {status === "funded" && txHash && (
          <p className="text-xs text-green-500 break-all">Tx: {txHash}</p>
        )}
        {(status === "failed" || status === "rate_limited") && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
