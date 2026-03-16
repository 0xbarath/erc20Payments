import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getTransactionsByWallet } from "@/lib/repositories/transactions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const wallet = searchParams.get("wallet");
    const limitParam = searchParams.get("limit");

    if (!wallet || !isAddress(wallet)) {
      return NextResponse.json(
        { error: "Valid wallet address required" },
        { status: 400 }
      );
    }

    const limit = Math.min(Math.max(parseInt(limitParam ?? "10", 10) || 10, 1), 50);
    const supabase = createSupabaseServiceClient();
    const transactions = await getTransactionsByWallet(supabase, wallet, limit);

    return NextResponse.json(transactions);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
