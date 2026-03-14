import { createClient, http } from "viem";
import { baseSepolia, optimismSepolia } from "viem/chains";
import { addFaucetFunds } from "porto/viem/RelayActions";

const chains: Record<number, (typeof baseSepolia | typeof optimismSepolia)> = {
  [baseSepolia.id]: baseSepolia,
  [optimismSepolia.id]: optimismSepolia,
};
const RELAY_URL = "https://rpc.porto.sh";

export async function requestFaucetFunds(params: {
  address: string;
  chainId: number;
  tokenAddress: string;
}): Promise<string | null> {
  const chain = chains[params.chainId];
  if (!chain) throw new Error(`Unsupported chain: ${params.chainId}`);

  const client = createClient({ chain, transport: http(RELAY_URL) });

  const result = await addFaucetFunds(client, {
    address: params.address as `0x${string}`,
    tokenAddress: params.tokenAddress as `0x${string}`,
    value: 10_000_000n, // 10 USDC (6 decimals)
  });

  return result?.transactionHash ?? null;
}
