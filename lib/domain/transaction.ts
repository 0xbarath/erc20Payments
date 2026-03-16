export interface Transaction {
  id: string;
  paymentIntentId: string;
  txHash: string;
  blockNumber: string;
  blockHash: string;
  fromAddress: string;
  toAddress: string;
  gasUsed: string;
  effectiveGasPrice: string;
  status: "success" | "reverted";
  chainId: number;
  logCount: number;
  createdAt: string;
}
