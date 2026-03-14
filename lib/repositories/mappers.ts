import type { PaymentIntent } from "@/lib/domain/x9a-compatible-intent";

// DB row → domain type
export function mapIntentFromDb(row: Record<string, unknown>): PaymentIntent {
  return {
    id: row.id as string,
    version: "0.1.0",
    vendorId: row.vendor_id as string,
    vendorSlug: row.vendor_slug as string,
    invoiceId: row.invoice_id as string,
    merchantName: row.merchant_name as string,
    mode: "merchant_presented",
    displayCurrency: row.display_currency as "USD",
    displayAmount: row.display_amount as string,
    chainId: row.chain_id as number,
    tokenAddress: row.token_address as string,
    tokenSymbol: row.token_symbol as string,
    tokenDecimals: row.token_decimals as number,
    recipientAddress: row.recipient_address as string,
    atomicAmount: row.atomic_amount as string,
    nonce: row.nonce as string,
    expiresAt: row.expires_at as string,
    status: row.status as PaymentIntent["status"],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    portoExtension: row.porto_extension as PaymentIntent["portoExtension"],
  };
}

// Domain type → DB insert row
export function mapIntentToDb(intent: PaymentIntent) {
  return {
    id: intent.id,
    vendor_id: intent.vendorId,
    vendor_slug: intent.vendorSlug,
    invoice_id: intent.invoiceId,
    merchant_name: intent.merchantName,
    display_currency: intent.displayCurrency,
    display_amount: intent.displayAmount,
    chain_id: intent.chainId,
    token_address: intent.tokenAddress,
    token_symbol: intent.tokenSymbol,
    token_decimals: intent.tokenDecimals,
    recipient_address: intent.recipientAddress,
    atomic_amount: intent.atomicAmount,
    nonce: intent.nonce,
    expires_at: intent.expiresAt,
    porto_extension: intent.portoExtension,
    status: intent.status,
    tx_hash: intent.portoExtension?.txHash,
  };
}

export interface VendorRow {
  id: string;
  slug: string;
  name: string;
  recipient_address: string;
  default_chain_id: number;
  default_token_address: string;
  created_at: string;
}

export interface Vendor {
  id: string;
  slug: string;
  name: string;
  recipientAddress: string;
  defaultChainId: number;
  defaultTokenAddress: string;
  createdAt: string;
}

export function mapVendorFromDb(row: VendorRow): Vendor {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    recipientAddress: row.recipient_address,
    defaultChainId: row.default_chain_id,
    defaultTokenAddress: row.default_token_address,
    createdAt: row.created_at,
  };
}
