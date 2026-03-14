import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_DEFAULT_CHAIN_ID: z.coerce.number().default(84532),
  NEXT_PUBLIC_ENABLE_FAUCET: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  MERCHANT_WALLET_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
});

let _clientEnv: z.infer<typeof clientSchema> | null = null;
let _serverEnv: z.infer<typeof serverSchema> | null = null;

export function getClientEnv() {
  if (!_clientEnv) {
    _clientEnv = clientSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_DEFAULT_CHAIN_ID: process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID,
      NEXT_PUBLIC_ENABLE_FAUCET: process.env.NEXT_PUBLIC_ENABLE_FAUCET,
    });
  }
  return _clientEnv;
}

export function getServerEnv() {
  if (!_serverEnv) {
    _serverEnv = serverSchema.parse({
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      MERCHANT_WALLET_ADDRESS: process.env.MERCHANT_WALLET_ADDRESS,
    });
  }
  return _serverEnv;
}
