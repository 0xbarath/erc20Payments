"use client";

import { useState, useEffect, useCallback } from "react";
import type { Transaction } from "@/lib/domain/transaction";

export function useWalletTransactions(address: string | undefined) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTransactions = useCallback(() => {
    if (!address) return;
    setIsLoading(true);
    fetch(`/api/transactions?wallet=${address}&limit=10`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setTransactions(data))
      .catch(() => setTransactions([]))
      .finally(() => setIsLoading(false));
  }, [address]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, isLoading, refetch: fetchTransactions };
}
