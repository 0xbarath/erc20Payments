"use client";

import { useAccount } from "wagmi";
import { Wallet } from "lucide-react";
import { WalletDetailsDrawer } from "@/components/wallet/wallet-details-drawer";

export function WalletStatus() {
  const { address, isConnected, chain } = useAccount();

  if (!isConnected || !address) return null;

  return (
    <WalletDetailsDrawer>
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-sm cursor-pointer hover:bg-accent/50 transition-colors">
        <Wallet className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <p className="font-mono truncate">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
          {chain && (
            <p className="text-xs text-muted-foreground">{chain.name}</p>
          )}
        </div>
      </div>
    </WalletDetailsDrawer>
  );
}
