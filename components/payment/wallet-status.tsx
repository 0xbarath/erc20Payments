"use client";

import { useAccount, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";

export function WalletStatus() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();

  if (!isConnected || !address) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-sm">
      <div className="flex-1 min-w-0">
        <p className="font-mono truncate">
          {address.slice(0, 6)}...{address.slice(-4)}
        </p>
        {chain && (
          <p className="text-xs text-muted-foreground">{chain.name}</p>
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={() => disconnect()}>
        Disconnect
      </Button>
    </div>
  );
}
