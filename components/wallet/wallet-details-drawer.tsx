"use client";

import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { Wallet, Copy, Check, ExternalLink } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useWalletBalances } from "@/hooks/use-wallet-balances";
import { useWalletTransactions } from "@/hooks/use-wallet-transactions";
import { CHAIN_EXPLORER_URLS } from "@/lib/config/chains";

function truncate(str: string, start = 6, end = 4) {
  if (str.length <= start + end + 2) return str;
  return `${str.slice(0, start)}...${str.slice(-end)}`;
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function WalletDetailsDrawer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { address, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { nativeBalance, tokenBalance, isLoading: balancesLoading } =
    useWalletBalances();
  const { transactions, isLoading: txLoading } = useWalletTransactions(
    open ? address : undefined
  );
  const [copied, setCopied] = useState(false);

  const explorerUrl = chain ? CHAIN_EXPLORER_URLS[chain.id] : undefined;

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <div className="overflow-y-auto max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Wallet Details
            </DrawerTitle>
            <DrawerDescription>
              Connected wallet information
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 space-y-4">
            {/* Address section */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">
                Address
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-sm truncate">
                  {address ? truncate(address, 10, 8) : ""}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={copyAddress}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
                {explorerUrl && address && (
                  <a
                    href={`${explorerUrl}/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                )}
              </div>
              {chain && <Badge variant="secondary">{chain.name}</Badge>}
            </div>

            {/* Balances section */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">
                Balances
              </p>
              <div className="space-y-1.5">
                {balancesLoading ? (
                  <>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-28" />
                  </>
                ) : (
                  <>
                    <p className="text-sm font-mono">
                      {nativeBalance ?? "—"}
                    </p>
                    <p className="text-sm font-mono">
                      {tokenBalance ?? "—"}
                    </p>
                  </>
                )}
              </div>
            </div>

            <Separator />

            {/* Recent Transactions section */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">
                Recent Transactions
              </p>
              {txLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No transactions yet
                </p>
              ) : (
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between rounded-md border p-2.5 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {explorerUrl ? (
                          <a
                            href={`${explorerUrl}/tx/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-blue-500 hover:underline"
                          >
                            {truncate(tx.txHash)}
                          </a>
                        ) : (
                          <span className="font-mono">
                            {truncate(tx.txHash)}
                          </span>
                        )}
                        <Badge
                          variant={
                            tx.status === "success"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {tx.status}
                        </Badge>
                      </div>
                      <span className="text-muted-foreground whitespace-nowrap ml-2">
                        {formatTime(tx.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  disconnect();
                }}
              >
                Disconnect Wallet
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
