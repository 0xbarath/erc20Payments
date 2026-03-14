# ERC-20 Vendor Checkout

Stablecoin payment checkout app powered by Porto wallet. Merchants display QR codes for payment intents; users scan/open and pay with USDC on testnet.

> **Disclaimer**: The "X9A-compatible" schema naming reflects architectural alignment with X9 payment data concepts, not standards compliance. This is not a normative X9.150 implementation.

## Stack

- **Frontend**: Next.js 16, Tailwind CSS v4, shadcn/ui
- **Wallet**: Wagmi + Porto connector
- **Chains**: Base Sepolia (84532), Optimism Sepolia (11155420)
- **Token**: Testnet USDC (ERC-20)
- **Database**: Supabase (Postgres + RLS)
- **Testing**: Vitest

## Setup

```bash
# Install dependencies
npm install

# Copy env vars
cp .env.example .env.local
# Fill in Supabase credentials

# Run Supabase migrations (in Supabase dashboard or CLI)
# See db/migrations/*.sql

# Seed the database
npm run seed

# Start dev server
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `NEXT_PUBLIC_APP_URL` | App URL for QR code generation |
| `NEXT_PUBLIC_DEFAULT_CHAIN_ID` | Default chain (84532) |
| `NEXT_PUBLIC_ENABLE_FAUCET` | Enable testnet faucet (true/false) |

## Supabase Setup

1. Create a new Supabase project
2. Run the SQL migrations in `db/migrations/` in order
3. Copy the project URL and keys to `.env.local`
4. Run `npm run seed` to insert demo data

## Architecture

```
User scans QR → /pay/[intentId] → Connect Porto wallet → Pay USDC → On-chain verify
```

**Payment Status Flow**:
```
awaiting_payment → wallet_connected → payment_submitted → payment_confirming → payment_confirmed
                                    → payment_failed
awaiting_payment → expired
```

**Key Directories**:
- `lib/domain/` — Payment intent schema, status machine
- `lib/services/` — Business logic (create intent, transition status, verify on-chain)
- `lib/porto/` — Porto wallet adapters
- `lib/erc20/` — ERC-20 calldata encoding
- `app/api/` — API routes
- `hooks/` — React hooks for wallet, payment, faucet
- `components/` — UI components
- `db/` — SQL migrations and seed script

## Porto Notes

- Uses `wallet_sendCalls` for direct ERC-20 transfer execution
- Faucet uses Porto's `experimental_addFaucetFunds` for testnet funding
- Prepared-call extension point stubbed in `lib/porto/prepared-calls.ts`

## Faucet

The testnet faucet is enabled by default (`NEXT_PUBLIC_ENABLE_FAUCET=true`). It allows users to request test USDC via Porto's built-in faucet. Disable in production.

## Testing

```bash
npm test
```

## Deploy

```bash
vercel deploy
```

Configure environment variables in the Vercel dashboard. Runtime is Node.js (not Edge) for Supabase SSR cookie handling.
