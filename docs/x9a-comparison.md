# X9.150 Normative vs. This Implementation

> This document explains the differences between the X9.150 standard for QR code-based payments and the application-defined schema used in this project.

## What is X9.150?

X9.150 is a formal specification from the Accredited Standards Committee X9 (financial services) that defines how payment data should be encoded in QR codes. It is designed for fiat payment rails (ACH, card networks) and follows conventions similar to the EMVCo QR Code Specification.

## Key Differences

| Aspect | X9.150 Normative | This App |
|--------|-----------------|----------|
| **QR Payload** | Self-contained TLV-encoded payment data (amount, merchant info, currency — all in the QR) | Self-contained TLV-encoded data: standard EMVCo fields + blockchain extension in Unreserved Templates (tags 80-81) |
| **Encoding** | Tag-Length-Value (TLV) binary format with strict field numbering | EMVCo-compatible TLV encoding with 2-digit lengths |
| **Mandatory Fields** | Merchant Account Info, Merchant Category Code (MCC), Transaction Currency (ISO 4217 numeric), Country Code (ISO 3166), Merchant Name | Full set: MCC, currency (ISO 4217 numeric), country, merchant name, amount, plus blockchain fields |
| **Integrity** | CRC-16 checksum embedded in QR data | CRC16-CCITT checksum (tag 63) |
| **Currency** | ISO 4217 numeric codes (e.g., `840` for USD) | ISO 4217 numeric in QR (tag 53 = `840`), plus on-chain token config in Unreserved Templates |
| **Payment Rails** | Fiat — ACH, card networks, real-time payments | ERC-20 token transfer on EVM chains |
| **Chain/Token** | No concept of blockchain, chain IDs, or token addresses | Core to the schema: `chainId`, `tokenAddress`, `atomicAmount` |
| **Offline Support** | QR is fully self-contained; can work offline between scan and processing | QR is self-contained for display (amount, merchant) and transaction construction (chain, token, recipient); server needed for status tracking |
| **Certification** | Formal testing and certification required to claim compliance | No certification; application-defined schema |

## What We Borrowed

The schema design is *inspired by* X9 payment QR concepts:

- **Payment intent as a structured data object** with merchant, amount, currency, and expiry
- **Merchant-presented mode** where the merchant generates the QR and the payer scans
- **Nonce/expiry** for replay protection and time-bounding
- **Status lifecycle** tracking the payment from creation through confirmation

## What We Added

These are application-specific extensions with no X9 equivalent:

- `chainId`, `tokenAddress`, `tokenSymbol`, `tokenDecimals` — blockchain-specific fields
- `atomicAmount` — integer token amount (no floats), computed server-side
- `portoExtension` — wallet-specific metadata (`callsId`, `txHash`)
- `recipientAddress` — on-chain wallet address (vs. bank account routing in X9)

## EMVCo TLV QR Code Encoder/Decoder (Implemented)

As of this version, the app **does** generate EMVCo-compatible TLV-encoded QR codes. The QR payload is no longer a bare URL — it is a self-contained EMVCo Merchant-Presented QR string.

### What changed

| Before | After |
|--------|-------|
| QR encoded a URL (`/pay/{intentId}`) | QR encodes a full TLV string with standard EMVCo fields + blockchain extension |
| No in-payload checksum | CRC16-CCITT checksum (tag 63) |
| No offline-readable payment data | Standard EMVCo fields readable by any compliant scanner (amount, currency, merchant) |

### Standard EMVCo fields used

| Tag | Field | Example |
|-----|-------|---------|
| 00 | Payload Format Indicator | `01` |
| 01 | Point of Initiation Method | `12` (dynamic) |
| 52 | Merchant Category Code | `0000` |
| 53 | Transaction Currency | `840` (USD, ISO 4217) |
| 54 | Transaction Amount | `25.00` |
| 58 | Country Code | `US` |
| 59 | Merchant Name | `Acme Store` |
| 60 | Merchant City | (empty) |
| 62 | Additional Data | Invoice ID (sub-01), Intent ID (sub-05) |
| 63 | CRC | CRC16-CCITT |

### Unreserved Templates (tags 80-81) — Blockchain Extension

EMVCo explicitly allows tags 80-99 as Unreserved Templates for third-party extensions. We split blockchain data across two templates to keep each value ≤99 chars (EMVCo 2-digit length constraint). Both use the GUID `erc20`.

**Tag 80 — Token Identity:**

| Sub-tag | Field | Example |
|---------|-------|---------|
| 00 | Globally Unique Identifier | `erc20` |
| 01 | Chain ID | `84532` |
| 02 | Token Address | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |
| 03 | Token Symbol | `USDC` |
| 04 | Token Decimals | `6` |

**Tag 81 — Transaction Details:**

| Sub-tag | Field | Example |
|---------|-------|---------|
| 00 | Globally Unique Identifier | `erc20` |
| 01 | Recipient Address | `0x742d35Cc6634C0532925a3b844Bc9e7595f2bD1e` |
| 02 | Atomic Amount | `25000000` |

Server-side data (nonce, expiry, payment URL) is accessible via the intent ID in tag 62 sub-tag 05.

### Implementation files

- `lib/qr/emv-tlv.ts` — TLV encoding/decoding primitives + CRC16-CCITT
- `lib/qr/serialize.ts` — `buildEmvQrData()` builds the full TLV string, `parseEmvQrData()` decodes and validates CRC
- `tests/unit/qr-serialization.test.ts` — round-trip and CRC validation tests

### Design decisions

- **Split across tags 80-81**: Ethereum addresses are 42 chars each. Two addresses plus a GUID would exceed the 99-char limit for a single template. Splitting token identity (tag 80) from transaction details (tag 81) keeps both compliant.
- **GUID `erc20`**: Shorter than a reverse-domain GUID to conserve space within the 99-char constraint.
- **Server-side metadata omitted**: Nonce, expiry, and payment URL are not in the QR. The intent ID (tag 62, sub-05) provides access to all server-side data. This keeps the QR compact while retaining everything needed to construct an on-chain transaction.

### Remaining differences from X9.150

1. **Different payment rails**: X9.150 targets fiat; we target ERC-20 transfers
2. **No certification path**: There is no X9 certification process for blockchain payment QR codes
3. **Hybrid approach**: The QR is self-contained for payment display and transaction construction, but the server remains authoritative for status tracking and validation
