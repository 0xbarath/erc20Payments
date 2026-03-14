import { baseSepolia, optimismSepolia } from "viem/chains";
import type { Chain } from "viem";

export const SUPPORTED_CHAINS: Record<number, Chain> = {
  [baseSepolia.id]: baseSepolia,
  [optimismSepolia.id]: optimismSepolia,
};

export const CHAIN_RPC_URLS: Record<number, string> = {
  [baseSepolia.id]: "https://sepolia.base.org",
  [optimismSepolia.id]: "https://sepolia.optimism.io",
};

export const CHAIN_EXPLORER_URLS: Record<number, string> = {
  [baseSepolia.id]: "https://sepolia.basescan.org",
  [optimismSepolia.id]: "https://sepolia-optimistic.etherscan.io",
};

export function isSupportedChain(chainId: number): boolean {
  return chainId in SUPPORTED_CHAINS;
}

export function getChain(chainId: number): Chain {
  const chain = SUPPORTED_CHAINS[chainId];
  if (!chain) throw new Error(`Unsupported chain: ${chainId}`);
  return chain;
}

export { baseSepolia, optimismSepolia };
