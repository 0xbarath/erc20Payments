/**
 * EMVCo-compatible TLV (Tag-Length-Value) encoding/decoding utilities.
 * Implements the Merchant-Presented QR format per EMVCo QR Code Specification.
 *
 * TLV format: [Tag:2 chars][Length:2 chars][Value:N chars]
 * Example: "000201" = tag "00", length "02", value "01"
 */

/** Encode a single TLV field. */
export function encodeTlv(tag: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${tag}${len}${value}`;
}

/** Encode a template (nested TLV): wraps concatenated sub-TLVs with a tag+length. */
export function encodeTemplate(tag: string, subtags: string): string {
  return encodeTlv(tag, subtags);
}

/**
 * CRC16-CCITT (polynomial 0x1021, initial value 0xFFFF).
 * Computes over the full QR string including the "6304" prefix.
 * Returns uppercase 4-char hex string.
 */
export function computeCrc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** Decode a TLV string into a Map of tag → value. */
export function decodeTlv(data: string): Map<string, string> {
  const result = new Map<string, string>();
  let pos = 0;
  while (pos + 4 <= data.length) {
    const tag = data.substring(pos, pos + 2);
    const len = parseInt(data.substring(pos + 2, pos + 4), 10);
    if (isNaN(len) || pos + 4 + len > data.length) break;
    const value = data.substring(pos + 4, pos + 4 + len);
    result.set(tag, value);
    pos += 4 + len;
  }
  return result;
}

/** Decode nested TLV within a template value (same format as top-level). */
export function decodeTemplate(value: string): Map<string, string> {
  return decodeTlv(value);
}
