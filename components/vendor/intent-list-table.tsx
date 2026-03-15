import Link from "next/link";
import type { PaymentIntent } from "@/lib/domain/x9a-compatible-intent";

export function IntentListTable({
  intents,
  vendorSlug,
}: {
  intents: PaymentIntent[];
  vendorSlug: string;
}) {
  if (intents.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        No invoices yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-left">
            <th className="px-4 py-2 font-medium">Invoice ID</th>
            <th className="px-4 py-2 font-medium">Amount</th>
            <th className="px-4 py-2 font-medium">Token</th>
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium">Created</th>
          </tr>
        </thead>
        <tbody>
          {intents.map((intent) => (
            <tr key={intent.id} className="border-b last:border-0">
              <td className="px-4 py-2">
                <Link
                  href={`/pay/${intent.id}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {intent.invoiceId}
                </Link>
              </td>
              <td className="px-4 py-2">${intent.displayAmount}</td>
              <td className="px-4 py-2">{intent.tokenSymbol}</td>
              <td className="px-4 py-2">
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                  {intent.status.replace(/_/g, " ")}
                </span>
              </td>
              <td className="px-4 py-2 text-muted-foreground">
                {new Date(intent.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
