import { Skeleton } from "@/components/ui/skeleton";

export default function VendorLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-96 w-full rounded-lg" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
