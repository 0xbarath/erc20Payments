import type { Address } from "viem";
import { baseSepolia, optimismSepolia } from "viem/chains";

export interface TokenConfig {
  address: Address;
  decimals: number;
  symbol: string;
}

export const USDC_CONFIG: Record<number, TokenConfig> = {
  [baseSepolia.id]: {
    address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    decimals: 6,
    symbol: "USDC",
  },
  [optimismSepolia.id]: {
    address: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
    decimals: 6,
    symbol: "USDC",
  },
};

export function getTokenConfig(chainId: number): TokenConfig {
  const config = USDC_CONFIG[chainId];
  if (!config) throw new Error(`No token config for chain: ${chainId}`);
  return config;
}
