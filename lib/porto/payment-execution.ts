import type { PaymentIntent } from "@/lib/domain/x9a-compatible-intent";
import { buildErc20TransferCall } from "@/lib/erc20/calldata";

type SendCallsFn = (params: {
  calls: { to: `0x${string}`; data: `0x${string}`; value: bigint }[];
}) => Promise<string>;

export async function executePortoPayment(
  sendCalls: SendCallsFn,
  intent: PaymentIntent
): Promise<string> {
  const call = buildErc20TransferCall(intent);
  const result = await sendCalls({
    calls: [{ to: call.to, data: call.data, value: call.value }],
  });
  return result;
}
