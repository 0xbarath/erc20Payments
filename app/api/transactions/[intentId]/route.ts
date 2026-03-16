import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getTransactionByIntent } from "@/lib/repositories/transactions";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ intentId: string }> }
) {
  try {
    const { intentId } = await params;
    const supabase = createSupabaseServiceClient();
    const transaction = await getTransactionByIntent(supabase, intentId);

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json(transaction);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
