import type { Address } from "viem";
import { baseSepolia, optimismSepolia } from "viem/chains";

export interface TokenConfig {
  address: Address;
  decimals: number;
  symbol: string;
}

export const TOKEN_CONFIG: Record<number, TokenConfig> = {
  [baseSepolia.id]: {
    address: "0xfca413a634c4df6b98ebb970a44d9a32f8f5c64e",
    decimals: 18,
    symbol: "EXP",
  },
  [optimismSepolia.id]: {
    address: "0xfca413a634c4df6b98ebb970a44d9a32f8f5c64e",
    decimals: 18,
    symbol: "EXP",
  },
};

export function getTokenConfig(chainId: number): TokenConfig {
  const config = TOKEN_CONFIG[chainId];
  if (!config) throw new Error(`No token config for chain: ${chainId}`);
  return config;
}
