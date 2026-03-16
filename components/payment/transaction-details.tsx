"use client";

import { useEffect, useState } from "react";
import type { Transaction } from "@/lib/domain/transaction";
import { CHAIN_EXPLORER_URLS } from "@/lib/config/chains";

function truncate(str: string, start = 6, end = 4) {
  if (str.length <= start + end + 2) return str;
  return `${str.slice(0, start)}...${str.slice(-end)}`;
}

export function TransactionDetails({
  intentId,
  chainId,
}: {
  intentId: string;
  chainId: number;
}) {
  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/transactions/${intentId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setTx(data))
      .finally(() => setLoading(false));
  }, [intentId]);

  if (loading) {
    return <p className="text-center text-xs text-muted-foreground">Loading transaction details...</p>;
  }

  if (!tx) return null;

  const explorerUrl = CHAIN_EXPLORER_URLS[chainId];

  return (
    <div className="space-y-2 rounded-md border p-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Tx Hash</span>
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
          <span className="font-mono">{truncate(tx.txHash)}</span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">From</span>
        <span className="font-mono">{truncate(tx.fromAddress)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">To</span>
        <span className="font-mono">{truncate(tx.toAddress)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Block</span>
        <span className="font-mono">{tx.blockNumber}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Gas Used</span>
        <span className="font-mono">{tx.gasUsed}</span>
      </div>
    </div>
  );
}
