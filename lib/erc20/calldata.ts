import { encodeFunctionData, erc20Abi, type Address } from "viem";
import type { PaymentIntent } from "@/lib/domain/x9a-compatible-intent";

export interface Erc20Call {
  to: Address;
  data: `0x${string}`;
  value: bigint;
}

export function buildErc20TransferCall(intent: PaymentIntent): Erc20Call {
  const data = encodeFunctionData({
    abi: erc20Abi,
    functionName: "transfer",
    args: [
      intent.recipientAddress as Address,
      BigInt(intent.atomicAmount),
    ],
  });

  return {
    to: intent.tokenAddress as Address,
    data,
    value: 0n,
  };
}
