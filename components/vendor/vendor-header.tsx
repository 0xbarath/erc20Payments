import type { Vendor } from "@/lib/repositories/mappers";

export function VendorHeader({ vendor }: { vendor: Vendor }) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold">{vendor.name}</h1>
      <p className="text-sm text-muted-foreground">/{vendor.slug}</p>
    </div>
  );
}
