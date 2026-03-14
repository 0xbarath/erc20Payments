import { getClientEnv } from "@/lib/config/env";
import type { PaymentIntent } from "@/lib/domain/x9a-compatible-intent";
import {
  encodeTlv,
  encodeTemplate,
  computeCrc16,
  decodeTlv,
  decodeTemplate,
} from "./emv-tlv";

/** GUID used in Unreserved Templates to identify our blockchain extension. */
const ERC20_GUID = "erc20";

/** Returns the web payment URL for a given intent. */
export function buildPaymentUrl(intent: PaymentIntent): string {
  const env = getClientEnv();
  return `${env.NEXT_PUBLIC_APP_URL}/pay/${intent.id}`;
}

/**
 * Build an EMVCo Merchant-Presented QR string (TLV format).
 *
 * Standard fields: payload format, initiation, MCC, currency, amount, country,
 * merchant name, merchant city, additional data (invoice + intent ID).
 *
 * Unreserved Templates (tags 80-81) for blockchain/stablecoin extension:
 *   - Tag 80: Token identity (GUID, chain ID, token address, symbol, decimals)
 *   - Tag 81: Transaction (GUID, recipient address, atomic amount)
 *
 * Each template value is kept ≤99 chars to comply with EMVCo 2-digit length fields.
 * Server-side data (nonce, expiry, payment URL) is accessible via the intent ID in tag 62.
 *
 * Tag 63: CRC16-CCITT checksum.
 */
export function buildEmvQrData(intent: PaymentIntent): string {
  // Standard EMVCo fields
  let qr = "";
  qr += encodeTlv("00", "01"); // Payload Format Indicator
  qr += encodeTlv("01", "12"); // Point of Initiation Method (dynamic)
  qr += encodeTlv("52", "0000"); // Merchant Category Code (not applicable)
  qr += encodeTlv("53", "840"); // Transaction Currency (USD / ISO 4217)
  qr += encodeTlv("54", intent.displayAmount); // Transaction Amount
  qr += encodeTlv("58", "US"); // Country Code
  qr += encodeTlv("59", intent.merchantName); // Merchant Name
  qr += encodeTlv("60", ""); // Merchant City (empty)

  // Additional Data (tag 62): invoice ID (sub-01) + reference/intent ID (sub-05)
  const additionalData =
    encodeTlv("01", intent.invoiceId) + encodeTlv("05", intent.id);
  qr += encodeTemplate("62", additionalData);

  // Unreserved Template (tag 80): token identity
  let tokenInfo = "";
  tokenInfo += encodeTlv("00", ERC20_GUID); // Globally Unique Identifier
  tokenInfo += encodeTlv("01", intent.chainId.toString()); // Chain ID
  tokenInfo += encodeTlv("02", intent.tokenAddress); // Token Address
  tokenInfo += encodeTlv("03", intent.tokenSymbol); // Token Symbol
  tokenInfo += encodeTlv("04", intent.tokenDecimals.toString()); // Token Decimals
  qr += encodeTemplate("80", tokenInfo);

  // Unreserved Template (tag 81): transaction details
  let txDetails = "";
  txDetails += encodeTlv("00", ERC20_GUID); // Globally Unique Identifier
  txDetails += encodeTlv("01", intent.recipientAddress); // Recipient Address
  txDetails += encodeTlv("02", intent.atomicAmount); // Atomic Amount
  qr += encodeTemplate("81", txDetails);

  // CRC (tag 63): append placeholder, compute, then append result
  const crcPlaceholder = qr + "6304";
  const crc = computeCrc16(crcPlaceholder);
  qr += encodeTlv("63", crc);

  return qr;
}

/**
 * Parse an EMVCo TLV QR string back to structured data.
 * Validates CRC16-CCITT checksum.
 *
 * Blockchain extension spans tags 80 (token identity) and 81 (transaction).
 */
export function parseEmvQrData(tlv: string): {
  standard: Map<string, string>;
  additionalData: Map<string, string> | null;
  tokenInfo: Map<string, string> | null;
  txDetails: Map<string, string> | null;
} {
  // Validate CRC: last 4 chars are the CRC value, preceded by "6304"
  const crcValue = tlv.slice(-4);
  const dataWithoutCrc = tlv.slice(0, -4);
  const computed = computeCrc16(dataWithoutCrc);
  if (computed !== crcValue) {
    throw new Error(`CRC mismatch: expected ${computed}, got ${crcValue}`);
  }

  const fields = decodeTlv(tlv);

  const additionalData = fields.has("62")
    ? decodeTemplate(fields.get("62")!)
    : null;

  const tokenInfo = fields.has("80")
    ? decodeTemplate(fields.get("80")!)
    : null;

  const txDetails = fields.has("81")
    ? decodeTemplate(fields.get("81")!)
    : null;

  return { standard: fields, additionalData, tokenInfo, txDetails };
}
