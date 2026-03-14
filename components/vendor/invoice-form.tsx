"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { baseSepolia, optimismSepolia } from "viem/chains";

export function InvoiceForm({ vendorSlug }: { vendorSlug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const amount = formData.get("amount") as string;
    const description = formData.get("description") as string;
    const chainId = parseInt(formData.get("chainId") as string, 10);

    try {
      const res = await fetch("/api/payment-intents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorSlug,
          invoiceId: `INV-${Date.now()}`,
          displayAmount: amount,
          chainId,
          description,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create invoice");
      }

      router.push(`/vendor/${vendorSlug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Invoice</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              name="amount"
              type="text"
              placeholder="25.00"
              pattern="^\d+(\.\d{1,2})?$"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chainId">Network</Label>
            <Select name="chainId" defaultValue={String(baseSepolia.id)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={String(baseSepolia.id)}>
                  Base Sepolia
                </SelectItem>
                <SelectItem value={String(optimismSepolia.id)}>
                  Optimism Sepolia
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Payment for..."
              rows={2}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Invoice"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
