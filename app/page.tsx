import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-8 py-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">ERC-20 Checkout</h1>
        <p className="text-muted-foreground">
          Stablecoin payment checkout powered by Porto
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">Demo Vendor</CardTitle>
        </CardHeader>
        <CardContent>
          <Link href="/vendor/acme-store">
            <Button className="w-full">Visit Acme Store</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
