"use client";

import { useAccount, useBalance, useReadContract } from "wagmi";
import { erc20Abi, formatUnits } from "viem";
import { TOKEN_CONFIG } from "@/lib/config/tokens";

export function useWalletBalances() {
  const { address, chainId } = useAccount();
  const tokenConfig = chainId ? TOKEN_CONFIG[chainId] : undefined;

  const {
    data: nativeBalance,
    isLoading: nativeLoading,
    refetch: refetchNative,
  } = useBalance({
    address,
  });

  const {
    data: tokenBalanceRaw,
    isLoading: tokenLoading,
    refetch: refetchToken,
  } = useReadContract({
    address: tokenConfig?.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!tokenConfig,
    },
  });

  const nativeFormatted = nativeBalance
    ? `${parseFloat(formatUnits(nativeBalance.value, nativeBalance.decimals)).toFixed(6)} ${nativeBalance.symbol}`
    : undefined;

  const tokenFormatted =
    tokenBalanceRaw !== undefined && tokenConfig
      ? `${parseFloat(formatUnits(tokenBalanceRaw as bigint, tokenConfig.decimals)).toFixed(2)} ${tokenConfig.symbol}`
      : undefined;

  return {
    nativeBalance: nativeFormatted,
    nativeSymbol: nativeBalance?.symbol,
    tokenBalance: tokenFormatted,
    tokenSymbol: tokenConfig?.symbol,
    isLoading: nativeLoading || tokenLoading,
    refetch: () => {
      refetchNative();
      refetchToken();
    },
  };
}
