import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getClientEnv, getServerEnv } from "@/lib/config/env";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export async function createSupabaseServerClient() {
  const env = getClientEnv();
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component — can't set cookies
          }
        },
      },
    }
  );
}

let _serviceClient: SupabaseClient | null = null;

export function createSupabaseServiceClient() {
  if (!_serviceClient) {
    const clientEnv = getClientEnv();
    const serverEnv = getServerEnv();
    _serviceClient = createClient(
      clientEnv.NEXT_PUBLIC_SUPABASE_URL,
      serverEnv.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return _serviceClient;
}
